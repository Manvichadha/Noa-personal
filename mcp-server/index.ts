import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import express from "express";
import cors from "cors";

// Define our single tool
const GENERATE_CONTENT_TOOL = {
  name: "generate_content",
  description: "Triggers the Noa content generation pipeline with a manual idea. Use this when the user brainstorms an idea and asks you to push it to the pipeline.",
  inputSchema: {
    type: "object",
    properties: {
      idea: {
        type: "string",
        description: "The raw idea, transcript, or brainstormed content that needs to be generated into a draft.",
      },
    },
    required: ["idea"],
  },
};

// Tool execution logic
async function handleGenerateContent(idea: string) {
  const authHeader = "Basic " + Buffer.from("noa:noa2026").toString("base64");
  try {
    const formData = new FormData();
    formData.append("inputType", "idea");
    formData.append("inputContent", idea);

    const response = await fetch("http://localhost:8080/api/generate", {
      method: "POST",
      headers: { "Authorization": authHeader },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        content: [{ type: "text", text: `Pipeline trigger failed. Server responded with ${response.status}: ${errorText}` }],
        isError: true,
      };
    }

    const data = await response.json();
    return {
      content: [{ type: "text", text: `Successfully triggered the generation pipeline! Job ID: ${data.jobId}` }],
    };
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Failed to execute generate_content tool: ${error.message || String(error)}` }],
      isError: true,
    };
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const MCP_API_KEY = process.env.MCP_API_KEY || "noa-secret-key-2026";

app.use((req, res, next) => {
  // Skip auth for /messages and /tools/list because the Claude client
  // often strips query params or doesn't include them in these REST requests.
  if (req.path === "/messages" || req.path === "/tools/list") {
    return next();
  }

  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const providedToken = authHeader ? authHeader.replace('Bearer ', '') : queryToken;

  if (providedToken !== MCP_API_KEY) {
    return res.status(401).json({ error: "Unauthorized API Key" });
  }
  next();
});

let globalTransport: SSEServerTransport | null = null;
let globalServer: Server | null = null;

// Tool Discovery Endpoint for Claude REST Handshake
app.get("/tools/list", (req, res) => {
  res.json({
    tools: [
      {
        ...GENERATE_CONTENT_TOOL,
        input_schema: GENERATE_CONTENT_TOOL.inputSchema, // Claude.ai expects snake_case for REST
      }
    ]
  });
});

// Claude connects here to establish the SSE stream
app.get("/mcp", async (req, res) => {
  // Claude's UI Custom Connector does a pre-flight JSON handshake to verify the server
  if (req.headers.accept && !req.headers.accept.includes("text/event-stream")) {
    return res.json({
      name: "noa-dashboard-mcp",
      version: "1.0.0",
      capabilities: { tools: {} },
      status: "online"
    });
  }

  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  
  // Create a brand new server instance for this connection
  const server = new Server(
    { name: "noa-dashboard-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [GENERATE_CONTENT_TOOL],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "generate_content") {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
    const argsSchema = z.object({ idea: z.string() });
    const parsed = argsSchema.safeParse(request.params.arguments);
    if (!parsed.success) {
      throw new McpError(ErrorCode.InvalidParams, "Invalid arguments.");
    }
    return handleGenerateContent(parsed.data.idea);
  });

  const transport = new SSEServerTransport(`/messages?token=${token}`, res);
  
  globalTransport = transport;
  globalServer = server;

  await server.connect(transport);
});

// Claude POSTs tool execution requests here
app.post("/messages", async (req, res) => {
  if (!globalTransport) {
    return res.status(400).json({ error: "SSE connection not established" });
  }
  await globalTransport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Remote MCP Server listening on port ${PORT}`);
  console.log(`Use Bearer token: ${MCP_API_KEY}`);
});

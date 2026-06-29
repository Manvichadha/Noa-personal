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

const MCP_API_KEY = process.env.MCP_API_KEY || "noa-secret-key-2026";

app.use((req, res, next) => {
  // Skip auth for /messages/* because the Claude client
  // often strips query params or doesn't include them in these REST requests.
  if (req.path.startsWith("/messages")) {
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

const transports = new Map<string, SSEServerTransport>();

// Claude connects here to establish the SSE stream
app.get("/mcp", async (req, res) => {
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

  const sessionId = Math.random().toString(36).substring(2, 15);
  // Put sessionId in the URL path, NOT the query string, to survive query stripping!
  const transport = new SSEServerTransport(`/messages/${sessionId}`, res);
  
  transports.set(sessionId, transport);
  res.on('close', () => transports.delete(sessionId));

  await server.connect(transport);
});

app.post("/messages/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  const transport = transports.get(sessionId);
  
  if (!transport) {
    return res.status(404).json({ error: "SSE connection not established or expired" });
  }
  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Remote MCP Server listening on port ${PORT}`);
  console.log(`Use Bearer token: ${MCP_API_KEY}`);
});

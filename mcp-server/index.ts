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

// Initialize the MCP Server
const server = new Server(
  {
    name: "noa-dashboard-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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

// Register the tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [GENERATE_CONTENT_TOOL],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "generate_content") {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }

  const argsSchema = z.object({ idea: z.string() });
  const parsed = argsSchema.safeParse(request.params.arguments);

  if (!parsed.success) {
    throw new McpError(ErrorCode.InvalidParams, "Invalid arguments: expected 'idea' string.");
  }

  const { idea } = parsed.data;
  
  // Basic auth to talk to your local Next.js API
  const authHeader = "Basic " + Buffer.from("noa:noa2026").toString("base64");

  try {
    const formData = new FormData();
    formData.append("inputType", "idea");
    formData.append("inputContent", idea);

    // Hit the local API on port 3001
    const response = await fetch("http://localhost:3001/api/generate", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        content: [
          {
            type: "text",
            text: `Pipeline trigger failed. Server responded with ${response.status}: ${errorText}`,
          },
        ],
        isError: true,
      };
    }

    const data = await response.json();

    return {
      content: [
        {
          type: "text",
          text: `Successfully triggered the generation pipeline! Job ID: ${data.jobId}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to execute generate_content tool: ${error.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// API Key authentication middleware
const MCP_API_KEY = process.env.MCP_API_KEY || "noa-secret-key-2026";

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${MCP_API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized API Key" });
  }
  next();
});

let transport: SSEServerTransport;

// Claude connects here to establish the SSE stream
app.get("/mcp", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

// Claude POSTs tool execution requests here
app.post("/messages", async (req, res) => {
  if (!transport) {
    return res.status(400).json({ error: "SSE connection not established" });
  }
  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Remote MCP Server listening on port ${PORT}`);
  console.log(`Use Bearer token: ${MCP_API_KEY}`);
});

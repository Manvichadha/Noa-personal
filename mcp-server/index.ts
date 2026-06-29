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

// --- DIAGNOSTIC LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  console.log(`\n[DIAGNOSTIC] Incoming Request: ${req.method} ${req.originalUrl}`);
  console.log(`[DIAGNOSTIC] Headers:`, JSON.stringify(req.headers));
  next();
});

const MCP_API_KEY = process.env.MCP_API_KEY || "noa-secret-key-2026";

let activeTransport: SSEServerTransport | null = null;

app.use((req, res, next) => {
  // Skip auth for /mcp POST requests because Claude client strips query params
  if (req.method === "POST" && req.path === "/mcp") {
    return next();
  }

  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const providedToken = authHeader ? authHeader.replace('Bearer ', '') : queryToken;

  if (providedToken !== MCP_API_KEY) {
    console.log(`[DIAGNOSTIC] Auth Failed. Provided: ${providedToken}, Expected: ${MCP_API_KEY}`);
    return res.status(401).json({ error: "Unauthorized API Key" });
  }
  next();
});

const transports = new Map<string, SSEServerTransport>();

// Claude connects here to establish the SSE stream
app.get("/mcp", async (req, res) => {
  console.log(`[DIAGNOSTIC] Handling GET /mcp request...`);
  try {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    const server = new Server(
      { name: "noa-dashboard-mcp", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.log(`[DIAGNOSTIC] Received ListTools request`);
      return { tools: [GENERATE_CONTENT_TOOL] };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.log(`[DIAGNOSTIC] Received CallTool request for ${request.params.name}`);
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

    console.log(`[DIAGNOSTIC] Calling server.connect(transport)...`);
    
    // We MUST pass /mcp here, although Claude's backend ignores it anyway.
    activeTransport = new SSEServerTransport("/mcp", res);
    
    res.on('close', () => {
      console.log(`[DIAGNOSTIC] SSE connection closed.`);
      activeTransport = null;
    });

    await server.connect(activeTransport);
    console.log(`[DIAGNOSTIC] server.connect() returned.`);
  } catch (err: any) {
    console.error(`[DIAGNOSTIC] CRITICAL ERROR in GET /mcp:`, err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Claude POSTs tool execution requests here
app.post("/mcp", async (req, res) => {
  console.log(`[DIAGNOSTIC] Handling POST /mcp`);
  
  if (!activeTransport) {
    console.log(`[DIAGNOSTIC] No active SSE transport found. Returning 400.`);
    return res.status(400).json({ error: "SSE connection not established" });
  }
  
  try {
    console.log(`[DIAGNOSTIC] Calling transport.handlePostMessage...`);
    await activeTransport.handlePostMessage(req, res);
    console.log(`[DIAGNOSTIC] transport.handlePostMessage completed successfully.`);
  } catch (err: any) {
    console.error(`[DIAGNOSTIC] CRITICAL ERROR in POST /mcp:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process message" });
    }
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Remote MCP Server listening on port ${PORT}`);
  console.log(`Use Bearer token: ${MCP_API_KEY}`);
  console.log(`Diagnostic Logging ENABLED`);
  console.log(`========================================\n`);
});

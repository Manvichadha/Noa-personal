#!/usr/bin/env node

import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function run() {
  // Connect to the remote Droplet SSE
  const sseTransport = new SSEClientTransport(new URL("https://marsh-alto-exotic-berkeley.trycloudflare.com/mcp?token=noa-secret-key-2026"));
  
  // Connect locally to Claude Desktop via Stdio
  const stdioTransport = new StdioServerTransport();

  await sseTransport.start();
  await stdioTransport.start();

  // Pipe messages from Droplet to Claude Desktop
  sseTransport.onmessage = async (message) => {
    await stdioTransport.send(message);
  };

  // Pipe messages from Claude Desktop to Droplet
  stdioTransport.onmessage = async (message) => {
    await sseTransport.send(message);
  };

  sseTransport.onerror = (err) => {
    console.error("SSE Error:", err);
  };
  
  stdioTransport.onerror = (err) => {
    console.error("Stdio Error:", err);
  };
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

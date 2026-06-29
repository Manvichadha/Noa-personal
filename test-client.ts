import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function run() {
  console.log("Connecting to remote SSE server...");
  const transport = new SSEClientTransport(new URL("https://marsh-alto-exotic-berkeley.trycloudflare.com/mcp?token=noa-secret-key-2026"));
  
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  console.log("Waiting for connection...");
  await client.connect(transport);
  console.log("Connected successfully!");

  const tools = await client.listTools();
  console.log("Available tools:", tools);

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// Import resources
import { registerTemplateResources } from './resources/templates.js';
import { registerDocResources } from './resources/docs.js';
// Import tools
import { registerAnalyzerTool } from './tools/analyzer.js';
import { registerGeneratorTool } from './tools/generator.js';
import { registerRunnerTool } from './tools/runner.js';
import { registerComponentTesterTool } from './tools/component-tester.js';
// Import prompts
import { registerPrompts } from './prompts/index.js';
export function createServer() {
    // Create MCP server
    const server = new McpServer({
        name: 'Frontend Testing Server',
        version: '1.0.0',
        description: 'MCP server for testing JavaScript/TypeScript code and React components'
    });
    // Register resources
    registerTemplateResources(server);
    registerDocResources(server);
    // Register tools
    registerAnalyzerTool(server);
    registerGeneratorTool(server);
    registerRunnerTool(server);
    registerComponentTesterTool(server);
    // Register prompts
    registerPrompts(server);
    return server;
}
//# sourceMappingURL=server.js.map
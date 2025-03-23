import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
export declare function registerGeneratorTool(server: McpServer): void;
export declare function generateTestCode(sourceCode: string, framework: string, testType: string, language: string, description?: string): string;

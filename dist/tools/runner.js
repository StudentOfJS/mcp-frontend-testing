import { z } from 'zod';
import { setupTestEnvironment, executeTest, cleanupTestEnvironment } from '../utils/test-environment.js';
import crypto from 'crypto';
import path from 'path';
import os from 'os';
import { executeCommand } from '../utils/command-executor.js';
export { executeCommand };
export function registerRunnerTool(server) {
    server.tool('runTest', {
        sourceCode: z.string(),
        testCode: z.string(),
        framework: z.enum(['jest', 'cypress']),
        type: z.enum(['unit', 'component', 'e2e']),
        config: z.record(z.any()).optional()
    }, async ({ sourceCode, testCode, framework, type, config }) => {
        try {
            // Create temporary test environment
            const testId = crypto.randomUUID();
            const testDir = path.join(os.tmpdir(), 'mcp-test-server', testId);
            // Set up files
            await setupTestEnvironment(testDir, sourceCode, testCode, framework, type, config);
            // Install dependencies
            await executeCommand('npm install', testDir);
            try {
                // Run the test
                const results = await executeTest(testDir, framework, type);
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify(results, null, 2)
                        }]
                };
            }
            finally {
                // Clean up
                await cleanupTestEnvironment(testDir);
            }
        }
        catch (error) {
            return {
                isError: true,
                content: [{
                        type: 'text',
                        text: `Error running test: ${String(error)}`
                    }]
            };
        }
    });
}
//# sourceMappingURL=runner.js.map
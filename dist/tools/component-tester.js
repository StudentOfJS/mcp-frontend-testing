import { z } from 'zod';
import { setupTestEnvironment, executeTest } from '../utils/test-environment.js';
import { generateTestCode } from './generator.js';
import { executeCommand } from '../utils/command-executor.js';
import crypto from 'crypto';
import path from 'path';
import os from 'os';
import { rm } from 'fs/promises';
export function registerComponentTesterTool(server) {
    server.tool('testReactComponent', {
        componentCode: z.string(),
        testCode: z.string().optional(),
        framework: z.enum(['jest', 'cypress']).default('jest'),
        props: z.record(z.any()).optional(),
        autoGenerateTest: z.boolean().default(true)
    }, async ({ componentCode, testCode, framework, props, autoGenerateTest }) => {
        try {
            // Determine language based on code
            const language = componentCode.includes('tsx') || componentCode.includes(':') ?
                'tsx' : (componentCode.includes('jsx') ? 'jsx' : 'javascript');
            // Generate test if not provided
            let finalTestCode = testCode;
            if (!finalTestCode && autoGenerateTest) {
                finalTestCode = await generateTestCode(componentCode, framework, 'component', language);
            }
            if (!finalTestCode) {
                throw new Error('No test code provided or generated');
            }
            // Create temporary test environment
            const testId = crypto.randomUUID();
            const testDir = path.join(os.tmpdir(), 'mcp-test-server', testId);
            // Set up files for component testing
            await setupTestEnvironment(testDir, componentCode, finalTestCode, framework, 'component', props);
            // Install dependencies
            await executeCommand('npm install', testDir);
            try {
                // Run the test
                const results = await executeTest(testDir, framework, 'component');
                return {
                    content: [{
                            type: 'text',
                            text: JSON.stringify(results, null, 2),
                        }],
                };
            }
            finally {
                // Clean up
                try {
                    await rm(testDir, { recursive: true, force: true });
                }
                catch (error) {
                    console.error('Error cleaning up test environment:', error);
                }
            }
        }
        catch (error) {
            return {
                isError: true,
                content: [{
                        type: 'text',
                        text: `Error testing component: ${String(error)}`,
                    }],
            };
        }
    });
}
//# sourceMappingURL=component-tester.js.map
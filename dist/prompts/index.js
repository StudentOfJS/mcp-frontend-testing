export function registerPrompts(server) {
    // Simplified implementation to avoid TypeScript errors
    // These prompts will be used by the LLM to generate test code
    // Unit test prompt
    server.prompt('create-unit-test', 'Create a unit test for the given code', () => ({
        messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: 'Please create a unit test for the provided code.',
                },
            }],
    }));
    // Component test prompt
    server.prompt('create-component-test', 'Create a test for a React component', () => ({
        messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: 'Please create a test for this React component. Focus on testing the component\'s functionality, props, and user interactions.',
                },
            }],
    }));
    // Fix failing test prompt
    server.prompt('fix-failing-test', 'Fix a failing test', () => ({
        messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: 'I have a test that\'s failing. Please help me fix it by explaining what\'s wrong and providing a fixed version of the test.',
                },
            }],
    }));
}
//# sourceMappingURL=index.js.map
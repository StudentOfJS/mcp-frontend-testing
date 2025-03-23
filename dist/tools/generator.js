import { z } from 'zod';
import { performCodeAnalysis } from './analyzer.js';
export function registerGeneratorTool(server) {
    server.tool('generateTest', {
        code: z.string(),
        framework: z.enum(['jest', 'cypress']),
        type: z.enum(['unit', 'component', 'e2e']),
        language: z.enum(['javascript', 'typescript', 'jsx', 'tsx']).default('javascript'),
        description: z.string().optional()
    }, async ({ code, framework, type, language, description }) => {
        try {
            const testCode = generateTestCode(code, framework, type, language, description);
            return {
                content: [{
                        type: 'text',
                        text: testCode,
                    }],
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{
                        type: 'text',
                        text: `Error generating test: ${String(error)}`,
                    }],
            };
        }
    });
}
// Helper function to generate test code based on source code and parameters
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateTestCode(sourceCode, framework, testType, language, description) {
    // Analyze the code to better understand its structure
    const analysis = performCodeAnalysis(sourceCode, language);
    // Extract component or function name
    const nameMatch = sourceCode.match(/(?:function|class|const)\s+(\w+)/);
    const name = nameMatch ? nameMatch[1] : 'Component';
    // Generate appropriate import statements based on framework and test type
    let imports = '';
    let testCode = '';
    if (framework === 'jest') {
        if (testType === 'unit') {
            imports = `// Import the module to test\n${language.includes('typescript') ? `import { ${name} } from './${name}';` : `const ${name} = require('./${name}');`}`;
            testCode = `describe('${name}', () => {
  test('${description || 'should work correctly'}', () => {
    // Arrange
    ${analysis?.codeType?.isFunction ? `
    // Example test input
    const input = 'test';
    
    // Act
    const result = ${name}(input);
    
    // Assert
    expect(result).toBeDefined();` : `
    // Setup any required state
    
    // Act - perform the action
    
    // Assert - check the result
    expect(true).toBe(true);`}
  });
${analysis?.complexity?.hasAsync ? `
  test('handles async operations', async () => {
    // Arrange
    
    // Act
    const result = await ${name}();
    
    // Assert
    expect(result).toBeDefined();
  });` : ''}
});`;
        }
        else if (testType === 'component') {
            imports = `import { render, screen${analysis?.complexity?.hasEvents ? ', fireEvent' : ''} } from '@testing-library/react';\n${analysis?.complexity?.hasEvents ? `import userEvent from '@testing-library/user-event';` : ''}\n${language.includes('typescript') ? `import { ${name} } from './${name}';` : `import  { default as ${name} } from './${name}';`}`;
            testCode = `describe('${name}', () => {
  test('renders correctly', () => {
    // Arrange
    render(<${name} />);
    
    // Assert
    expect(screen.getByText(/content/i)).toBeInTheDocument();
  });
${analysis.complexity?.hasEvents ? `
  test('handles user interaction', async () => {
    // Arrange
    render(<${name} />);
    
    // Act
    await userEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });` : ''}
${analysis?.complexity?.hasAsync ? `
  test('loads data asynchronously', async () => {
    // Arrange
    render(<${name} />);
    
    // Act - wait for async operation
    await screen.findByText(/loaded/i);
    
    // Assert
    expect(screen.getByText(/loaded/i)).toBeInTheDocument();
  });` : ''}
});`;
        }
    }
    else if (framework === 'cypress') {
        if (testType === 'component') {
            imports = `${language.includes('typescript') ? `import { ${name} } from './${name}';` : `import  Component from './Component';`}`;
            testCode = `describe('${name}', () => {
  it('renders correctly', () => {
    // Arrange
    cy.mount(<${name} />);
    
    // Assert
    cy.contains(/content/i).should('be.visible');
  });
${analysis?.complexity?.hasEvents ? `
  it('handles user interaction', () => {
    // Arrange
    cy.mount(<${name} />);
    
    // Act
    cy.get('button').click();
    
    // Assert
    cy.contains(/result/i).should('be.visible');
  });` : ''}
${analysis?.complexity?.hasAsync ? `
  it('loads data asynchronously', () => {
    // Arrange
    cy.mount(<${name} />);
    
    // Assert - wait for async operation
    cy.contains(/loaded/i, { timeout: 10000 }).should('be.visible');
  });` : ''}
});`;
        }
        else if (testType === 'e2e') {
            imports = '// No imports needed for Cypress E2E tests';
            testCode = `describe('${name} E2E Test', () => {
  beforeEach(() => {
    // Visit the page containing the component
    cy.visit('/');
  });

  it('${description || 'works correctly'}', () => {
    // Assert the component is rendered
    cy.contains(/content/i).should('be.visible');
${analysis?.complexity?.hasEvents ? `
    // Act - interact with the component
    cy.get('button').click();
    
    // Assert the interaction worked
    cy.contains(/result/i).should('be.visible');` : ''}
${analysis?.complexity?.hasAsync ? `
    // Assert async data loads correctly
    cy.contains(/loaded/i, { timeout: 10000 }).should('be.visible');` : ''}
  });
});`;
        }
    }
    // Combine imports and test code
    return `${imports}\n${testCode}`;
}
//# sourceMappingURL=generator.js.map
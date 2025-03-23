import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Get directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(__dirname, '../../templates');
export function registerTemplateResources(server) {
    // Register template resources
    server.resource('templates', new ResourceTemplate('templates://{framework}/{type}', {
        list: async () => {
            return {
                resources: [
                    {
                        uri: 'templates://jest/component',
                        name: 'Jest Component Test Template',
                        mimeType: 'text/plain',
                        description: 'Template for Jest React component tests'
                    },
                    {
                        uri: 'templates://jest/unit',
                        name: 'Jest Unit Test Template',
                        mimeType: 'text/plain',
                        description: 'Template for Jest unit tests'
                    },
                    {
                        uri: 'templates://cypress/component',
                        name: 'Cypress Component Test Template',
                        mimeType: 'text/plain',
                        description: 'Template for Cypress component tests'
                    }
                ]
            };
        }
    }), async (uri, { framework, type }) => {
        try {
            // Try to load the template file
            const filePath = path.join(templatesDir, framework, `${type}.txt`);
            const content = await readFile(filePath, 'utf-8');
            return {
                contents: [{
                        uri: uri.href,
                        text: content
                    }]
            };
        }
        catch (error) {
            // Fallback to hardcoded templates if file not found
            const templates = {
                jest: {
                    unit: `
// Jest unit test template
describe('Unit test', () => {
  test('should work correctly', () => {
    // Arrange
    
    // Act
    
    // Assert
    expect(true).toBe(true);
  });
});`,
                    component: `
// Jest React component test template
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from './Component';

describe('Component', () => {
  test('renders correctly', () => {
    // Arrange
    render(<Component />);
    
    // Assert
    expect(screen.getByText(/example/i)).toBeInTheDocument();
  });
});`,
                },
                cypress: {
                    component: `
// Cypress component test template
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    // Arrange
    cy.mount(<Component />);
    
    // Assert
    cy.contains(/example/i).should('be.visible');
  });
});`,
                }
            };
            const frameworkTemplates = templates[framework];
            const templateContent = frameworkTemplates && type in frameworkTemplates
                ? frameworkTemplates[type]
                : "Template not found";
            return {
                contents: [{
                        uri: uri.href,
                        text: templateContent
                    }]
            };
        }
    });
    // Template index
    server.resource('templates-index', 'templates://', async (uri) => {
        return {
            contents: [{
                    uri: uri.href,
                    text: JSON.stringify({
                        frameworks: [
                            'jest',
                            'cypress'
                        ],
                        types: [
                            'unit',
                            'component'
                        ]
                    }, null, 2)
                }]
        };
    });
}
//# sourceMappingURL=templates.js.map
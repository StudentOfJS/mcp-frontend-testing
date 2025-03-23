import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerDocResources(server: McpServer): void {
  server.resource(
    'docs',
    new ResourceTemplate('docs://{topic}', { 
      list: async () => {
        return {
          resources: [
            {
              uri: 'docs://jest',
              name: 'Jest Documentation',
              mimeType: 'text/plain',
              description: 'Documentation for Jest testing framework'
            },
            {
              uri: 'docs://cypress',
              name: 'Cypress Documentation',
              mimeType: 'text/plain',
              description: 'Documentation for Cypress testing framework'
            },
            {
              uri: 'docs://react-testing-library',
              name: 'React Testing Library Documentation',
              mimeType: 'text/plain',
              description: 'Documentation for React Testing Library'
            }
          ]
        };
      }
    }),
    async (uri, { topic }) => {
      const docs: Record<string, string> = {
        jest: `
# Jest Documentation

Jest is a JavaScript testing framework designed to ensure correctness of any JavaScript codebase. It allows you to write tests with an approachable, familiar and feature-rich API that gives you results quickly.

## Key Features

- Zero config for most JavaScript projects
- Snapshots for tracking large objects
- Isolated test files to avoid sharing state
- Powerful mocking library

## Basic Example

\`\`\`javascript
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
\`\`\`
`,
        cypress: `
# Cypress Documentation

Cypress is a next generation front end testing tool built for the modern web. It enables you to write faster, easier and more reliable tests.

## Key Features

- Time Travel: Cypress takes snapshots as your tests run
- Debuggability: Debug directly from familiar tools like Chrome DevTools
- Automatic Waiting: Cypress automatically waits for commands and assertions
- Real-time Reloads: Test is automatically reloaded when you make changes

## Basic Example

\`\`\`javascript
describe('My First Test', () => {
  it('clicks the link "type"', () => {
    cy.visit('https://example.cypress.io')
    cy.contains('type').click()
    cy.url().should('include', '/commands/actions')
  })
})
\`\`\`
`,
        'react-testing-library': `
# React Testing Library Documentation

React Testing Library is a very light-weight solution for testing React components. It provides light utility functions on top of react-dom and react-dom/test-utils, encouraging better testing practices.

## Key Features

- Works with actual DOM nodes
- Focuses on testing from the user perspective
- Encourages accessibility best practices
- Simple and intuitive API

## Basic Example

\`\`\`javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Component from './Component.js';

test('loads and displays greeting', async () => {
  // Arrange
  render(<Component />)
  
  // Act
  await userEvent.click(screen.getByText('Load Greeting'))
  
  // Assert
  expect(screen.getByRole('heading')).toHaveTextContent('hello there')
})
\`\`\`
`
      };

      return {
        contents: [{
          uri: uri.href,
          text: docs[topic as keyof typeof docs] || 'Documentation not found'
        }]
      };
    }
  );
  
  // Documentation index
  server.resource(
    'docs-index',
    'docs://',
    async (uri) => {
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify({
            topics: [
              'jest',
              'cypress',
              'react-testing-library'
            ]
          }, null, 2)
        }]
      };
    }
  );
}

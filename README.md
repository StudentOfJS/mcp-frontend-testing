# MCP Frontend Testing Server

## Description

This MCP server provides tools for frontend testing, including:

- **Code Analysis**: Analyzes JavaScript/TypeScript code to determine appropriate testing strategies.
- **Test Generation**: Generates unit and component tests for Jest and Cypress.
- **Test Running**: Executes tests using Jest and Cypress and returns results.
- **Component Testing**: Provides a tool specifically for testing React components.

## Getting Started

### Installation

1.  **Clone the repository:**
    \`git clone <repository-url> mcp-frontend-testing\`
2.  **Navigate to the project directory:**
    \`cd mcp-frontend-testing\`
3.  **Install dependencies:**
    \`npm install\`

### Running the Server

#### HTTP Transport

\`\`\`bash
# Build the server
npm run build

# Start the server with HTTP transport
npm run start:http
\`\`\`

#### Stdio Transport

\`\`\`bash
# Build the server
npm run build

# Start the server with Stdio transport
npm run start:stdio
\`\`\`

## Usage

### Tools

-   **analyzeCode**: Analyzes code and returns analysis results.
    -   **Parameters**:
        -   \`code\` (string, required): The source code to analyze.
        -   \`language\` (enum, optional): Language of the code (\`javascript\` | \`typescript\` | \`jsx\` | \`tsx\`, default: \`javascript\`).
-   **generateTest**: Generates test code based on source code and framework.
    -   **Parameters**:
        -   \`code\` (string, required): The source code to generate tests for.
        -   \`framework\` (enum, required): Testing framework (\`jest\` | \`cypress\`).
        -   \`type\` (enum, required): Type of test (\`unit\` | \`component\` | \`e2e\`).
        -   \`language\` (enum, optional): Language of the code (\`javascript\` | \`typescript\` | \`jsx\` | \`tsx\`, default: \`javascript\`).
        -   \`description\` (string, optional): Description of the test case.
-   **runTest**: Runs tests and returns results.
    -   **Parameters**:
        -   \`sourceCode\` (string, required): The source code being tested.
        -   \`testCode\` (string, required): The test code to execute.
        -   \`framework\` (enum, required): Testing framework (\`jest\` | \`cypress\`).
        -   \`type\` (enum, required): Type of test (\`unit\` | \`component\` | \`e2e\`).
        -   \`config\` (record, optional): Configuration object for test execution.
-   **testReactComponent**: Runs component tests specifically for React components.
    -   **Parameters**:
        -   \`componentCode\` (string, required): The source code of the React component.
        -   \`testCode\` (string, optional): Test code for the component (auto-generated if not provided).
        -   \`framework\` (enum, optional): Testing framework (\`jest\` | \`cypress\`, default: \`jest\`).
        -   \`props\` (record, optional): Props to pass to the component during testing.
        -   \`autoGenerateTest\` (boolean, optional): Automatically generate test code if not provided (default: \`true\`).

### Resources

-   **templates**: Provides test templates.
    -   **URI**: \`templates://{framework}/{type}\`
    -   **Parameters**:
        -   \`framework\` (string, required): Testing framework (\`jest\` | \`cypress\`).
        -   \`type\` (string, required): Type of template (\`unit\` | \`component\`).
-   **docs**: Provides documentation for testing frameworks.
    -   **URI**: \`docs://{topic}\`
    -   **Parameters**:
        -   \`topic\` (string, required): Documentation topic (\`jest\` | \`cypress\` | \`react-testing-library\`).

## Deployment

### Docker

Build and run the server using Docker:

\`\`\`bash
docker build -t mcp-frontend-testing .
docker run -p 3000:3000 mcp-frontend-testing
\`\`\`

### Cloud

Deploy to cloud platforms like AWS Lambda, Google Cloud Run, or Azure Functions for serverless or containerized deployments.

---

**Note**: This server is designed to be used with an MCP client to enable LLMs to perform frontend testing tasks.
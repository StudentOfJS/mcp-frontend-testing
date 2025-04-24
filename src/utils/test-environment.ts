import { mkdir, writeFile, rm } from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { getDefaultJestConfig, getDefaultCypressConfig, getComponentTestWrappers, getDependencies } from './test-config.js';
import { executeCommand } from './command-executor.js';

const execPromise = util.promisify(exec);

// Set up a test environment with all necessary files
export async function setupTestEnvironment(
  testDir: string, 
  sourceCode: string, 
  testCode: string, 
  framework: 'jest' | 'cypress',
  type: 'unit' | 'component' | 'e2e',
  config?: Record<string, any>
): Promise<void> {
  // Create directory structure
  await mkdir(testDir, { recursive: true });
  
  // Determine file extensions
  const isTypeScript = sourceCode.includes('typescript') || 
                       sourceCode.includes('tsx') || 
                       sourceCode.includes(':') || 
                       sourceCode.includes('interface');
  const isReact = sourceCode.includes('React') || 
                 sourceCode.includes('react') || 
                 sourceCode.includes('JSX') || 
                 sourceCode.includes('<div') || 
                 sourceCode.includes('</');
  
  const sourceExt = isTypeScript 
    ? (isReact ? '.tsx' : '.ts') 
    : (isReact ? '.jsx' : '.js');
  
  const testExt = isTypeScript 
    ? (framework === 'jest' ? '.test.tsx' : '.cy.tsx') 
    : (framework === 'jest' ? '.test.jsx' : '.cy.jsx');
  
  // Extract component or function name
  const nameMatch = sourceCode.match(/(?:function|class|const)\s+(\w+)/);
  const name = nameMatch ? nameMatch[1] : 'Component';
  
  // Write source file
  await writeFile(path.join(testDir, `${name}${sourceExt}`), sourceCode);
  
  // Write test file
  await writeFile(path.join(testDir, `${name}${testExt}`), testCode);
  
  // Write configuration files
  if (framework === 'jest') {
    await writeFile(
      path.join(testDir, 'jest.config.js'),
      config?.jestConfig || getDefaultJestConfig(type, isTypeScript) as string
    );
    
    // Setup for React testing
    if (isReact) {
      await writeFile(
        path.join(testDir, 'setupTests.js'),
        `import '@testing-library/jest-dom';`
      );
    }
  } else if (framework === 'cypress') {
    await writeFile(
      path.join(testDir, 'cypress.config.js'),
      config?.cypressConfig || getDefaultCypressConfig(type, isTypeScript) as string
    );
    
    // Create cypress directory structure for e2e tests
    if (type === 'e2e') {
      await mkdir(path.join(testDir, 'cypress', 'e2e'), { recursive: true });
      await writeFile(
        path.join(testDir, 'cypress', 'e2e', `${name}.cy.js`),
        testCode
      );
    }
    
    // Setup for component testing
    if (type === 'component') {
      await mkdir(path.join(testDir, 'cypress', 'support'), { recursive: true });
      await writeFile(
        path.join(testDir, 'cypress', 'support', 'component.js'),
        `import { mount } from 'cypress/react18'
import './commands'
Cypress.Commands.add('mount', mount)`
      );
      
      await writeFile(
        path.join(testDir, 'cypress', 'support', 'commands.js'),
        `// Custom commands go here`
      );
    }
  }
  
  // Set up package.json
  await writeFile(
    path.join(testDir, 'package.json'),
    JSON.stringify({
      name: 'mcp-test',
      version: '1.0.0',
      type: 'module',
      dependencies: getDependencies(framework, type, isTypeScript, isReact),
      scripts: {
        test: framework === 'jest' ? 'jest' : 'cypress run'
      }
    }, null, 2)
  );
  
  // Create a basic index.html file for e2e tests
  if (framework === 'cypress' && type === 'e2e') {
    await writeFile(
      path.join(testDir, 'index.html'),
      `<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.js"></script>
</body>
</html>`
    );
    
    await writeFile(
      path.join(testDir, 'index.js'),
      `import React from 'react';
import ReactDOM from 'react-dom/client';
import ${name} from './${name}';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <${name} />
  </React.StrictMode>
);`
    );
  }
}

// Set up environment specifically for component testing
export async function setupComponentTestEnvironment(
  testDir: string,
  componentCode: string,
  testCode: string,
  framework: 'jest' | 'cypress',
  props?: Record<string, any>
): Promise<void> {
  // Determine if TypeScript
  const isTypeScript = componentCode.includes('typescript') || 
                       componentCode.includes('tsx') || 
                       componentCode.includes(':');
  
  // Create directory structure
  await mkdir(testDir, { recursive: true });
  
  // Extract component name
  const nameMatch = componentCode.match(/(?:function|class|const)\s+(\w+)/);
  const name = nameMatch ? nameMatch[1] : 'Component';
  
  // Determine file extensions
  const sourceExt = isTypeScript ? '.tsx' : '.jsx';
  const testExt = isTypeScript 
    ? (framework === 'jest' ? '.test.tsx' : '.cy.tsx') 
    : (framework === 'jest' ? '.test.jsx' : '.cy.jsx');
  
  // Write component file
  await writeFile(path.join(testDir, `${name}${sourceExt}`), componentCode);
  
  // Write test file
  await writeFile(path.join(testDir, `${name}${testExt}`), testCode);
  
  // Create props file if props provided
  if (props) {
    await writeFile(
      path.join(testDir, 'props.json'),
      JSON.stringify(props, null, 2)
    );
    
    // Create a wrapper component for the tests
    const { wrapperCode, importStatement } = getComponentTestWrappers(name, isTypeScript);
    
    await writeFile(
      path.join(testDir, `TestWrapper${sourceExt}`),
      `${importStatement}
import ${name} from './${name}';
import testProps from './props.json';

${wrapperCode}`
    );
  }
  
  // Set up configuration
  if (framework === 'jest') {
    await writeFile(
      path.join(testDir, 'jest.config.js'),
      getDefaultJestConfig('component', isTypeScript) as string
    );
    
    await writeFile(
      path.join(testDir, 'setupTests.js'),
      `import '@testing-library/jest-dom';`
    );
  } else {
    await writeFile(
      path.join(testDir, 'cypress.config.js'),
      getDefaultCypressConfig('component', isTypeScript) as string
    );
    
    await mkdir(path.join(testDir, 'cypress', 'support'), { recursive: true });
    await writeFile(
      path.join(testDir, 'cypress', 'support', 'component.js'),
      `import { mount } from 'cypress/react18'
import './commands'
Cypress.Commands.add('mount', mount)`
    );
    
    await writeFile(
      path.join(testDir, 'cypress', 'support', 'commands.js'),
      `// Custom commands go here`
    );
  }
  
  // Set up package.json
  await writeFile(
    path.join(testDir, 'package.json'),
    JSON.stringify({
      name: 'mcp-component-test',
      version: '1.0.0',
      type: 'module',
      dependencies: getDependencies(framework, 'component', isTypeScript, true),
      scripts: {
        test: framework === 'jest' ? 'jest' : 'cypress run-component'
      }
    }, null, 2)
  );
}

// Execute tests and return results
export async function executeTest(
  testDir: string,
  framework: 'jest' | 'cypress',
  type: 'unit' | 'component' | 'e2e'
): Promise<any> {
  // Change to test directory
  const cwd = process.cwd();
  process.chdir(testDir);
  
  try {
    // Install dependencies
    console.info('Installing dependencies...');
    await executeCommand('npm install --silent', testDir);
    
    // Run tests
    console.info(`Running ${framework} ${type} tests...`);
    let result;
    if (framework === 'jest') {
      result = await executeCommand('npx jest --json', testDir);
      return JSON.parse(result.stdout);
    } else if (framework === 'cypress') {
      if (type === 'component') {
        result = await executeCommand('npx cypress run-component --reporter json', testDir);
      } else {
        result = await executeCommand('npx cypress run --reporter json', testDir);
      }
      return result.stdout ? JSON.parse(result.stdout) : { success: false, error: result.stderr };
    }
  } catch (error) {
    console.error('Test execution error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    // Change back to original directory
    process.chdir(cwd);
  }
}

// Execute component tests
export async function executeComponentTest(
  testDir: string,
  framework: 'jest' | 'cypress'
): Promise<any> {
  return executeTest(testDir, framework, 'component');
}

// Clean up test environment
export async function cleanupTestEnvironment(testDir: string): Promise<void> {
  try {
    await rm(testDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
  }
}
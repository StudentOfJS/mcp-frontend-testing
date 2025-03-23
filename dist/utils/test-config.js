// Default Jest configuration for different test types
export function getDefaultJestConfig(type, isTypeScript) {
    const baseConfig = {
        transform: {},
        testEnvironment: type === 'component' ? 'jsdom' : 'node',
        setupFilesAfterEnv: type === 'component' ? ['<rootDir>/setupTests.js'] : [],
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
        moduleDirectories: ['node_modules', '<rootDir>'],
    };
    if (isTypeScript) {
        baseConfig.transform = { '\\.(ts|tsx)$': 'ts-jest' };
        baseConfig.testRegex = '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$';
        baseConfig.moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];
    }
    else {
        baseConfig.transform = { '\\.(js|jsx)$': 'babel-jest' };
        baseConfig.testRegex = '(/__tests__/.*|\\.(test|spec))\\.(js|jsx)$';
        baseConfig.moduleFileExtensions = ['js', 'jsx', 'json', 'node'];
    }
    return `export default ${JSON.stringify(baseConfig, null, 2)};`;
}
// Default Cypress configuration for different test types
export function getDefaultCypressConfig(type, isTypeScript) {
    let config;
    if (type === 'component') {
        config = {
            component: {
                devServer: {
                    framework: 'react',
                    bundler: 'vite',
                },
                specPattern: isTypeScript ? '**/*.cy.{js,jsx,ts,tsx}' : '**/*.cy.{js,jsx}',
            },
        };
    }
    else {
        config = {
            e2e: {
                setupNodeEvents(on, config) {
                    return config;
                },
                specPattern: isTypeScript ? 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}' : 'cypress/e2e/**/*.cy.{js,jsx}',
            },
        };
    }
    return `import { defineConfig } from 'cypress'

export default defineConfig(${JSON.stringify(config, null, 2)})`;
}
// Generate component wrappers for testing with props
export function getComponentTestWrappers(componentName, isTypeScript) {
    const importStatement = isTypeScript
        ? `import React from 'react';`
        : `import React from 'react';`;
    const wrapperCode = isTypeScript
        ? `export const TestWrapper: React.FC = () => {
  return <${componentName} {...testProps} />;
};

export default TestWrapper;`
        : `export const TestWrapper = () => {
  return <${componentName} {...testProps} />;
};

export default TestWrapper;`;
    return { wrapperCode, importStatement };
}
// Get dependencies for package.json based on test configuration
export function getDependencies(framework, type, isTypeScript, isReact) {
    const dependencies = {
        // Common dependencies
        "jest": "^29.7.0",
    };
    // TypeScript dependencies
    if (isTypeScript) {
        dependencies["typescript"] = "^5.3.3";
        dependencies["ts-jest"] = "^29.1.1";
        dependencies["@types/jest"] = "^29.5.11";
    }
    // React dependencies
    if (isReact) {
        dependencies["react"] = "^18.2.0";
        dependencies["react-dom"] = "^18.2.0";
        if (isTypeScript) {
            dependencies["@types/react"] = "^18.2.42";
            dependencies["@types/react-dom"] = "^18.2.17";
        }
    }
    // Framework-specific dependencies
    if (framework === 'jest') {
        dependencies["jest-environment-jsdom"] = "^29.7.0";
        if (type === 'component' || isReact) {
            dependencies["@testing-library/react"] = "^14.1.2";
            dependencies["@testing-library/jest-dom"] = "^6.1.5";
            dependencies["@testing-library/user-event"] = "^14.5.1";
        }
    }
    else if (framework === 'cypress') {
        dependencies["cypress"] = "^13.6.1";
        if (type === 'component' || isReact) {
            dependencies["@cypress/react"] = "^7.0.3";
        }
    }
    // Build tools
    dependencies["esbuild"] = "^0.19.9";
    return dependencies;
}
//# sourceMappingURL=test-config.js.map
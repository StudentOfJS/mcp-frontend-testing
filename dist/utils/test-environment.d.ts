export declare function setupTestEnvironment(testDir: string, sourceCode: string, testCode: string, framework: 'jest' | 'cypress', type: 'unit' | 'component' | 'e2e', config?: Record<string, any>): Promise<void>;
export declare function setupComponentTestEnvironment(testDir: string, componentCode: string, testCode: string, framework: 'jest' | 'cypress', props?: Record<string, any>): Promise<void>;
export declare function executeTest(testDir: string, framework: 'jest' | 'cypress', type: 'unit' | 'component' | 'e2e'): Promise<any>;
export declare function executeComponentTest(testDir: string, framework: 'jest' | 'cypress'): Promise<any>;
export declare function cleanupTestEnvironment(testDir: string): Promise<void>;

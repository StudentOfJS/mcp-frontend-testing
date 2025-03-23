export declare function getDefaultJestConfig(type: 'unit' | 'component' | 'e2e', isTypeScript: boolean): string;
export declare function getDefaultCypressConfig(type: 'unit' | 'component' | 'e2e', isTypeScript: boolean): string;
export declare function getComponentTestWrappers(componentName: string, isTypeScript: boolean): {
    wrapperCode: string;
    importStatement: string;
};
export declare function getDependencies(framework: string, type: string, isTypeScript: boolean, isReact: boolean): Record<string, string>;

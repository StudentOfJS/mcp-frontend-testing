import { z } from 'zod';
export function registerAnalyzerTool(server) {
    server.tool('analyzeCode', {
        code: z.string(),
        language: z.enum(['javascript', 'typescript', 'jsx', 'tsx']).default('javascript')
    }, async ({ code, language }) => {
        try {
            // Analyze code to determine what kind of tests would be appropriate
            const analysis = performCodeAnalysis(code, language);
            return {
                content: [{
                        type: 'text',
                        text: JSON.stringify(analysis, null, 2),
                    }],
            };
        }
        catch (error) {
            return {
                isError: true,
                content: [{
                        type: 'text',
                        text: `Error analyzing code: ${String(error)}`,
                    }],
            };
        }
    });
}
// Helper function to analyze code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function performCodeAnalysis(code, language) {
    const analysisResult = {
        codeType: {},
        complexity: {},
        recommendations: {}
    };
    try {
        // Determine if the code is a React component
        const isReactComponent = code.includes('import React') ||
            code.includes('from "react"') ||
            code.includes("from 'react'") ||
            code.includes('extends Component') ||
            code.includes('React.Component') ||
            ((code.includes('export') && code.includes('return')) &&
                (code.includes('JSX.') || code.includes('<div') || code.includes('<>')));
        // Check if it's a function or class
        const isClass = code.includes('class ') && code.includes('extends ');
        const isFunction = code.includes('function ') || code.includes('=>');
        // Check if it uses hooks
        const usesHooks = code.includes('useState') ||
            code.includes('useEffect') ||
            code.includes('useContext') ||
            code.includes('useReducer') ||
            code.includes('useCallback') ||
            code.includes('useMemo');
        // Count imports to determine complexity
        const importMatches = code.match(/import .+ from .+/g);
        const imports = importMatches ? importMatches.length : 0;
        // Look for event handlers
        const hasEvents = code.includes('onClick') ||
            code.includes('onChange') ||
            code.includes('onSubmit') ||
            code.includes('addEventListener');
        // Look for async operations
        const hasAsync = code.includes('async ') ||
            code.includes('await ') ||
            code.includes('Promise') ||
            code.includes('.then(') ||
            code.includes('fetch(');
        const recommendedTestTypes = [];
        if (isReactComponent) {
            recommendedTestTypes.push('component');
            if (hasEvents || hasAsync) {
                recommendedTestTypes.push('e2e');
            }
            else {
                recommendedTestTypes.push('unit');
            }
        }
        else {
            recommendedTestTypes.push('unit');
        }
        // Recommend testing frameworks
        const recommendedFrameworks = [];
        if (isReactComponent) {
            recommendedFrameworks.push('jest');
            if (hasEvents) {
                recommendedFrameworks.push('cypress');
            }
            else {
                recommendedFrameworks.push('jest');
            }
        }
        else {
            recommendedFrameworks.push('jest');
        }
        analysisResult.codeType = {
            isReactComponent,
            isClass,
            isFunction,
            usesHooks,
        };
        analysisResult.complexity = {
            imports,
            hasEvents,
            hasAsync
        };
        analysisResult.recommendations = {
            testTypes: recommendedTestTypes,
            frameworks: recommendedFrameworks,
            priority: hasAsync ? 'high' : 'medium'
        };
    }
    catch (error) {
        console.error(`Error during code analysis: ${error.message}`);
    }
    return analysisResult;
}
//# sourceMappingURL=analyzer.js.map
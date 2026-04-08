// Pytest-style test runner for Python code execution in browser
// Uses Pyodide to run actual pytest tests

// @ts-ignore - Pyodide types
import { loadPyodide } from "pyodide";

// @ts-ignore - Pyodide types
type PyodideInterface = any;

let pyodideInstance: PyodideInterface | null = null;

// Initialize Pyodide with pytest
async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  pyodideInstance = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/",
  });

  // Install pytest
  await pyodideInstance.loadPackage("micropip");
  const micropip = pyodideInstance.pyimport("micropip");
  await micropip.install("pytest");

  return pyodideInstance;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export interface TestSuiteResult {
  total: number;
  passed: number;
  failed: number;
  tests: TestResult[];
  success: boolean;
  error?: string;
}

// Run pytest on user code with test functions
export async function runPytest(
  _userCode: string,
  testCode: string
): Promise<TestSuiteResult> {
  try {
    const pyodide = await getPyodide();

    // Write test code to file
    await pyodide.runPythonAsync(`
import sys
with open('test_user_code.py', 'w') as f:
    f.write(${JSON.stringify(testCode.replace(/\\/g, '\\\\').replace(/'/g, "\\'"))})
`);

    // Run pytest
    const resultJson = await pyodide.runPythonAsync(`
import pytest
import json

class JSONReporter:
    def __init__(self):
        self.results = []
    
    def pytest_runtest_logreport(self, report):
        if report.when == 'call':
            self.results.append({
                'name': report.nodeid,
                'passed': report.passed,
                'failed': report.failed,
                'longrepr': str(report.longrepr) if report.longrepr else None
            })

plugin = JSONReporter()
exit_code = pytest.main(['test_user_code.py', '-v', '--tb=short'], plugins=[plugin])
json.dumps({'results': plugin.results, 'exit_code': exit_code})
`);

    const result = JSON.parse(resultJson);
    const testResults: any[] = result.results;
    const exitCode: number = result.exit_code;
    
    const passed = testResults.filter(t => t.passed).length;
    const failed = testResults.filter(t => t.failed).length;

    return {
      total: testResults.length,
      passed,
      failed,
      tests: testResults.map(t => ({
        name: t.name.split('::').pop() || t.name,
        passed: t.passed,
        error: t.longrepr || undefined,
        duration: 0,
      })),
      success: exitCode === 0,
    };
  } catch (error: any) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      tests: [],
      success: false,
      error: error.message || "Test execution failed",
    };
  }
}

// Simple assertion-based test runner (lighter weight, no pytest needed)
export async function runSimpleTests(
  userCode: string,
  testCases: Array<{
    name: string;
    setup?: string;
    assertions: string;
  }>
): Promise<TestSuiteResult> {
  try {
    const pyodide = await getPyodide();
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const startTime = Date.now();
      let passed = false;
      let error: string | undefined;

      try {
        // Combine user code with test
        const testCode = `
${userCode}

${testCase.setup || ''}

# Run assertions
${testCase.assertions}
`;

        await pyodide.runPythonAsync(testCode);
        passed = true;
      } catch (e: any) {
        passed = false;
        error = e.message || "Assertion failed";
      }

      results.push({
        name: testCase.name,
        passed,
        error,
        duration: Date.now() - startTime,
      });
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    return {
      total: results.length,
      passed,
      failed,
      tests: results,
      success: failed === 0,
    };
  } catch (error: any) {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      tests: [],
      success: false,
      error: error.message || "Test execution failed",
    };
  }
}

// Reset Pyodide state
export function resetPyodide() {
  pyodideInstance = null;
}

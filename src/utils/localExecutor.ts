// Python execution using Pyodide (real Python in browser via WebAssembly)
// @ts-ignore - Pyodide types
import { loadPyodide } from "pyodide";

// @ts-ignore - Pyodide types
type PyodideInterface = any;

let pyodideInstance: PyodideInterface | null = null;
let isInitializing = false;
let initPromise: Promise<PyodideInterface> | null = null;

// Initialize Pyodide
export async function getPyodide(): Promise<PyodideInterface> {
  // Return existing instance
  if (pyodideInstance) {
    return pyodideInstance;
  }
  
  // Return existing initialization promise
  if (initPromise) {
    return initPromise;
  }
  
  // Start initialization
  isInitializing = true;
  initPromise = (async () => {
    try {
      pyodideInstance = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/",
      });
      
      // Load common packages (numpy, pandas, matplotlib, etc.)
      console.log('Loading common packages...');
      await pyodideInstance.loadPackage(['numpy', 'pandas']);
      console.log('Common packages loaded successfully');
      
      console.log('Pyodide initialized successfully');
      return pyodideInstance;
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error);
      initPromise = null;
      isInitializing = false;
      throw error;
    }
  })();
  
  return initPromise;
}

// Execute Python code
export async function executePythonLocal(code: string): Promise<{
  stdout: string;
  stderr: string;
  success: boolean;
}> {
  try {
    const pyodide = await getPyodide();
    
    // Capture stdout and stderr
    let stdout = '';
    let stderr = '';
    
    // Redirect Python's stdout and stderr
    pyodide.setStdout({
      batched: (msg: string) => {
        stdout += msg + '\n';
      },
    });
    
    pyodide.setStderr({
      batched: (msg: string) => {
        stderr += msg + '\n';
      },
    });
    
    // Execute the code
    await pyodide.runPythonAsync(code);
    
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      success: !stderr,
    };
  } catch (error: any) {
    return {
      stdout: '',
      stderr: error.message || 'Unknown error',
      success: false,
    };
  }
}

// Execute Python code with tests
export async function executePythonWithTests(
  userCode: string,
  testCode: string
): Promise<{
  passed: boolean;
  output: string;
  error?: string;
}> {
  try {
    const pyodide = await getPyodide();
    
    let output = '';
    let errorOutput = '';
    
    pyodide.setStdout({
      batched: (msg: string) => {
        output += msg + '\n';
      },
    });
    
    pyodide.setStderr({
      batched: (msg: string) => {
        errorOutput += msg + '\n';
      },
    });
    
    // Combine user code with test code
    const fullCode = `${userCode}\n\n${testCode}`;
    
    await pyodide.runPythonAsync(fullCode);
    
    const passed = output.includes('TESTS_PASSED') && !errorOutput;
    
    return {
      passed,
      output: output.trim(),
      error: errorOutput.trim() || undefined,
    };
  } catch (error: any) {
    return {
      passed: false,
      output: '',
      error: error.message || 'Test execution error',
    };
  }
}

// Reset Pyodide (clear all variables and state)
export function resetPyodide() {
  if (pyodideInstance) {
    // Run Python to clear namespace
    try {
      pyodideInstance.runPython(`
import sys
sys.modules.clear()
      `);
    } catch (e) {
      // Ignore errors during reset
    }
  }
}

// Check if Pyodide is ready
export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}

// Get initialization status
export function getInitStatus(): { ready: boolean; initializing: boolean } {
  return {
    ready: pyodideInstance !== null,
    initializing: isInitializing,
  };
}

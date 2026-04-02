// Code execution using Pyodide (real Python)
import { executePythonLocal, executePythonWithTests as pyodideWithTests } from "./localExecutor";

export async function executeCode(language: string, sourceCode: string) {
  if (language === "python") {
    const result = await executePythonLocal(sourceCode);
    return {
      run: {
        stdout: result.stdout,
        stderr: result.stderr,
      },
    };
  }

  return {
    run: {
      stdout: `Execution for ${language} is not available. Use Python.`,
      stderr: "",
    },
  };
}

export async function executeCodeWithTests(
  language: string,
  userCode: string,
  testCode: string
) {
  if (language === "python") {
    return await pyodideWithTests(userCode, testCode);
  }

  return {
    passed: false,
    output: `Testing for ${language} is not available.`,
  };
}

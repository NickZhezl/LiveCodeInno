// Code execution utility - uses local JavaScript-based Python checker
// No external API needed - everything runs in browser
import { executePythonWithTests as localExecuteWithTests, executePythonLocal as localExecute } from "./localExecutor";

export async function executeCode(language: string, sourceCode: string) {
  // For Python, use local execution
  if (language === "python") {
    const result = await localExecute(sourceCode);
    return {
      run: {
        stdout: result.stdout,
        stderr: result.stderr,
      },
    };
  }

  // For other languages, return not implemented
  return {
    run: {
      stdout: `Execution for ${language} is not yet implemented locally.`,
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
    return await localExecuteWithTests(userCode, testCode);
  }

  return {
    passed: false,
    output: `Testing for ${language} is not yet implemented.`,
  };
}

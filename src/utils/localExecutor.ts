// Simple Python code checker - pure JavaScript, no external dependencies
// Supports basic Python syntax validation and test execution simulation

interface TestResult {
  passed: boolean;
  output: string;
  error?: string;
}

// Simple Python variable extractor
function extractVariables(code: string): Record<string, any> {
  const variables: Record<string, any> = {};
  
  // Match simple assignments: var = value
  const assignmentRegex = /(\w+)\s*=\s*(.+?)(?:\n|$)/g;
  let match;
  
  while ((match = assignmentRegex.exec(code)) !== null) {
    const [, varName, value] = match;
    try {
      // Try to parse the value
      variables[varName] = parsePythonValue(value.trim());
    } catch (e) {
      // Keep as string if can't parse
      variables[varName] = value.trim();
    }
  }
  
  return variables;
}

// Parse Python value to JavaScript
function parsePythonValue(value: string): any {
  // Remove quotes for strings
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Parse numbers
  if (/^-?\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  if (/^-?\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }
  
  // Parse lists
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1);
    if (!inner.trim()) return [];
    return inner.split(',').map(item => parsePythonValue(item.trim()));
  }
  
  // Parse booleans
  if (value === 'True') return true;
  if (value === 'False') return false;
  if (value === 'None') return null;
  
  return value;
}

// Execute Python-like code and check results
export function executePythonLocal(code: string): Promise<{
  stdout: string;
  stderr: string;
  success: boolean;
}> {
  return new Promise((resolve) => {
    try {
      let output = '';
      let error = '';
      
      // Extract variables
      const variables = extractVariables(code);
      
      // Check for print statements
      const printRegex = /print\((.+?)\)/g;
      let printMatch;
      
      while ((printMatch = printRegex.exec(code)) !== null) {
        const [, arg] = printMatch;
        
        // Handle f-strings
        if (arg.startsWith('f"') || arg.startsWith("f'")) {
          let formatted = arg.slice(2, -1);
          // Replace {var} with actual values
          formatted = formatted.replace(/\{(\w+)\}/g, (match, varName) => {
            return variables[varName] !== undefined ? String(variables[varName]) : match;
          });
          output += formatted + '\n';
        } else if (arg.startsWith('"') || arg.startsWith("'")) {
          // Simple string
          output += arg.slice(1, -1) + '\n';
        } else {
          // Variable
          const value = variables[arg.trim()];
          if (value !== undefined) {
            output += formatPythonOutput(value) + '\n';
          } else {
            error += `NameError: name '${arg.trim()}' is not defined\n`;
          }
        }
      }
      
      resolve({
        stdout: output.trim(),
        stderr: error.trim(),
        success: !error,
      });
    } catch (e: any) {
      resolve({
        stdout: '',
        stderr: e.message || 'Syntax Error',
        success: false,
      });
    }
  });
}

// Format value like Python would
function formatPythonOutput(value: any): string {
  if (Array.isArray(value)) {
    return '[' + value.map(formatPythonOutput).join(', ') + ']';
  }
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }
  if (value === null) {
    return 'None';
  }
  return String(value);
}

// Execute code with test validation
export async function executePythonWithTests(
  userCode: string,
  testCode: string
): Promise<TestResult> {
  try {
    // Extract variables from user code
    const userVars = extractVariables(userCode);
    
    // Check what the test expects
    const testLines = testCode.split('\n');
    let allPassed = true;
    let output = '';
    
    for (const line of testLines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Check for assertions
      if (trimmed.startsWith('assert')) {
        const passed = evaluateAssertion(trimmed, userVars);
        if (!passed) {
          allPassed = false;
          output += `AssertionError: ${trimmed}\n`;
        } else {
          output += `✓ ${trimmed}\n`;
        }
      }
      
      // Check for print statements in test
      if (trimmed.startsWith('print(')) {
        const arg = trimmed.slice(6, -1);
        if (arg.startsWith('f"') || arg.startsWith("f'")) {
          let formatted = arg.slice(2, -1);
          formatted = formatted.replace(/\{(\w+)\}/g, (match, varName) => {
            return userVars[varName] !== undefined ? String(userVars[varName]) : match;
          });
          output += formatted + '\n';
        }
      }
    }
    
    // Check for TESTS_PASSED marker
    if (allPassed) {
      output += 'TESTS_PASSED';
    }
    
    return {
      passed: allPassed,
      output: output.trim(),
    };
  } catch (e: any) {
    return {
      passed: false,
      output: '',
      error: e.message || 'Test execution error',
    };
  }
}

// Evaluate simple assertions
function evaluateAssertion(assertion: string, variables: Record<string, any>): boolean {
  try {
    // Remove 'assert ' prefix
    const condition = assertion.replace('assert ', '').trim();
    
    // Handle isinstance checks
    const isinstanceMatch = condition.match(/isinstance\((\w+),\s*(\w+)\)/);
    if (isinstanceMatch) {
      const [, varName, typeName] = isinstanceMatch;
      const value = variables[varName];
      
      if (value === undefined) return false;
      
      switch (typeName) {
        case 'int': return typeof value === 'number' && Number.isInteger(value);
        case 'float': return typeof value === 'number';
        case 'str': return typeof value === 'string';
        case 'list': return Array.isArray(value);
        case 'bool': return typeof value === 'boolean';
        case 'dict': return typeof value === 'object' && !Array.isArray(value);
        default: return true;
      }
    }
    
    // Handle equality checks
    const eqMatch = condition.match(/(.+?)\s*==\s*(.+)/);
    if (eqMatch) {
      const [, left, right] = eqMatch;
      const leftVal = getVariableValue(left.trim(), variables);
      const rightVal = parsePythonValue(right.trim());
      return leftVal === rightVal;
    }
    
    // Handle inequality checks
    const neqMatch = condition.match(/(.+?)\s*!=\s*(.+)/);
    if (neqMatch) {
      const [, left, right] = neqMatch;
      const leftVal = getVariableValue(left.trim(), variables);
      const rightVal = parsePythonValue(right.trim());
      return leftVal !== rightVal;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Get variable value from expression
function getVariableValue(expr: string, variables: Record<string, any>): any {
  // Check if it's a direct variable
  if (variables[expr] !== undefined) {
    return variables[expr];
  }
  
  // Check for attribute access like len(x)
  const lenMatch = expr.match(/len\((\w+)\)/);
  if (lenMatch) {
    const varName = lenMatch[1];
    const value = variables[varName];
    if (Array.isArray(value) || typeof value === 'string') {
      return value.length;
    }
  }
  
  return expr;
}

// Reset any state (not needed for this implementation)
export function resetPyodide() {
  // No-op for local execution
}

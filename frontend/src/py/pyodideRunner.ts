// Pyodide types for TypeScript
declare global {
  interface Window {
    loadPyodide: (options?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  setStdout: (options: { batched: (s: string) => void }) => void;
  setStderr: (options: { batched: (s: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<any>;
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

async function getPyodide() {
  if (!pyodidePromise) {
    // Load pyodide directly from CDN
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js";
    script.async = true;
    
    const loadScript = new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Pyodide"));
      document.head.appendChild(script);
    });
    
    await loadScript;
    
    if (!window.loadPyodide) {
      throw new Error("Pyodide not loaded properly");
    }
    
    pyodidePromise = window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/",
    });
  }
  return pyodidePromise;
}

export async function runPython(code: string) {
  const py = await getPyodide();

  let stdout = "";
  let stderr = "";

  // перехват stdout/stderr
  py.setStdout({ batched: (s: string) => { stdout += s; } });
  py.setStderr({ batched: (s: string) => { stderr += s; } });

  try {
    await py.runPythonAsync(code);
    return { stdout, stderr };
  } catch (e: any) {
    return { stdout, stderr: (stderr + (e?.message ?? String(e))).trim() };
  }
}

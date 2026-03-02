import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodidePromise: Promise<PyodideInterface> | null = null;

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({
      // можно оставить без indexURL — pyodide сам подтянет нужное
      // но иногда стабильнее указать CDN:
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

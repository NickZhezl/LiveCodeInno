import { PGlite } from "@electric-sql/pglite";
import { runPython } from "./py/pyodideRunner";

export const executeCode = async (language: string, sourceCode: string) => {
  // Python (Pyodide)
  if (language === "python") {
    const { stdout, stderr } = await runPython(sourceCode);
    return { run: { output: (stdout ?? "").trim(), stderr: (stderr ?? "").trim() || null } };
  }

  // SQL (PGlite / PostgreSQL) — чистая БД на каждый запуск
  if (language === "postgresql") {
    const pg = new PGlite();
    try {
      const result = await pg.exec(sourceCode);
      let out = "";

      for (const res of result) {
        if (res.rows && res.rows.length > 0) {
          const cols = res.fields.map((f) => f.name);
          for (const row of res.rows as any[]) {
            out += cols.map((c) => String(row[c])).join("|") + "\n";
          }
        }
      }

      return { run: { output: out.trim() || "Query executed successfully (no output).", stderr: null } };
    } catch (e: any) {
      return { run: { output: "", stderr: e?.message ?? String(e) } };
    }
  }

  return { run: { output: "", stderr: `Unsupported language: ${language}` } };
};

import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";
import { PGlite } from "@electric-sql/pglite";

// Инициализируем базу данных один раз при загрузке страницы.
// Это позволяет сохранять созданные таблицы между запусками кода.
const pg = new PGlite();

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

export const executeCode = async (language: string, sourceCode: string) => {
  // === ЛОГИКА ДЛЯ POSTGRESQL (Локально в браузере) ===
  if (language === "postgresql") {
    try {
      // PGlite может выполнять несколько SQL-команд за раз
      const result = await pg.exec(sourceCode);
      
      let output = "";

      // Обрабатываем результаты каждого запроса (их может быть несколько)
      result.forEach((res) => {
        // 1. Если это SELECT и есть строки данных
        if (res.rows && res.rows.length > 0) {
           // Получаем заголовки (названия колонок)
           const columns = res.fields.map((f) => f.name).join(" | ");
           output += `\n[TABLE]\n${columns}\n${"-".repeat(columns.length)}\n`;
           
           // Получаем данные строк
           res.rows.forEach((row: any) => {
             // Собираем значения в строку через разделитель
             output += Object.values(row).join(" | ") + "\n";
           });
           output += "\n";
        } 
        // 2. Если это команда без возврата данных (CREATE, INSERT, UPDATE)
        else {
           output += `Query OK. Rows affected: ${res.affectedRows || 0}\n`;
        }
      });

      // Возвращаем объект в том же формате, что и Piston API
      return {
        run: {
          output: output || "Query executed successfully (no output).",
          stderr: null,
        }
      };
    } catch (error: any) {
      // Если ошибка SQL (синтаксис и т.д.)
      return {
        run: {
          output: "",
          stderr: error.message,
        }
      };
    }
  }

  // === ЛОГИКА ДЛЯ ОСТАЛЬНЫХ ЯЗЫКОВ (Piston API) ===
  const response = await API.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
  });
  return response.data;
};
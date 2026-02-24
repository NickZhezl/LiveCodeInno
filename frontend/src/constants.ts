export const LANGUAGE_VERSIONS: { [key: string]: string } = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  java: "15.0.2",
  csharp: "6.12.0",
  php: "8.2.3",
  sqlite3: "3.36.0", // SQLite
  postgresql: "15.0" // PostgreSQL
};

export const CODE_SNIPPETS: { [key: string]: string } = {
  javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
  typescript: `\ntype Params = {\n\tname: string;\n}\n\nfunction greet(data: Params) {\n\tconsole.log("Hello, " + data.name + "!");\n}\n\ngreet({ name: "Alex" });\n`,
  
  // Python с правильными отступами
  python: `import sys\n\ndef main():\n    print("Hello from Python!")\n\nif __name__ == "__main__":\n    main()\n`,
  
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
  csharp: `using System;\n\nnamespace HelloWorld\n{\n\tclass Hello { \n\t\tstatic void Main(string[] args) {\n\t\t\tConsole.WriteLine("Hello World in C#");\n\t\t}\n\t}\n}\n`,
  php: "<?php\n\n$name = 'Alex';\necho $name;\n",

  postgresql: `-- 1. Создание таблицы
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INT
);

-- 2. Вставка данных
INSERT INTO users (name, age) VALUES ('Alice', 30), ('Bob', 25);

-- 3. Выборка
SELECT * FROM users;
`,
  
  // SQL шаблон (удаляем и создаем заново таблицу каждый раз)
  sqlite3: `
-- 1. Удаляем таблицу если есть (для перезапуска)
DROP TABLE IF EXISTS users;

-- 2. Создаем таблицу
CREATE TABLE users (
  id INTEGER PRIMARY KEY, 
  name TEXT, 
  age INTEGER
);

-- 3. Вставка данных
INSERT INTO users (name, age) VALUES ('Alice', 30);
INSERT INTO users (name, age) VALUES ('Bob', 25);

-- 4. Выборка
SELECT * FROM users;
`,
};
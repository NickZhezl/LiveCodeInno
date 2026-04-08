// PostgreSQL Problems Bank
export interface PostgresProblem {
  id: string;
  title: string;
  category: string;
  level: number;
  description: string;
  starterCode: string;
  testCode: string;
  expectedOutput: string;
  solutionCode: string;
}

export const POSTGRES_PROBLEMS: PostgresProblem[] = [
  // === BASIC ===
  {
    id: "pg-basic-1",
    title: "Выборка всех сотрудников",
    category: "Основы SQL",
    level: 1,
    description: "Выберите все столбцы из таблицы employees",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
INSERT INTO employees VALUES (1, 'Alice', 60000, 'IT');
INSERT INTO employees VALUES (2, 'Bob', 40000, 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 55000, 'IT');
`,
    expectedOutput: "1|Alice|60000|IT\n2|Bob|40000|HR\n3|Charlie|55000|IT",
    solutionCode: `SELECT * FROM employees;`,
  },
  {
    id: "pg-basic-2",
    title: "Фильтрация по зарплате",
    category: "Основы SQL",
    level: 2,
    description: "Выберите имена сотрудников с зарплатой выше 50000",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
INSERT INTO employees VALUES (1, 'Alice', 60000, 'IT');
INSERT INTO employees VALUES (2, 'Bob', 40000, 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 55000, 'IT');
`,
    expectedOutput: "Alice\nCharlie",
    solutionCode: `SELECT name FROM employees WHERE salary > 50000;`,
  },
  {
    id: "pg-basic-3",
    title: "Сортировка результатов",
    category: "Основы SQL",
    level: 2,
    description: "Выберите всех сотрудников, отсортированных по зарплате (по убыванию)",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
INSERT INTO employees VALUES (1, 'Alice', 60000, 'IT');
INSERT INTO employees VALUES (2, 'Bob', 40000, 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 55000, 'IT');
`,
    expectedOutput: "1|Alice|60000|IT\n3|Charlie|55000|IT\n2|Bob|40000|HR",
    solutionCode: `SELECT * FROM employees ORDER BY salary DESC;`,
  },
  // === INTERMEDIATE ===
  {
    id: "pg-intermediate-1",
    title: "Агрегация по отделам",
    category: "Агрегация",
    level: 4,
    description: "Посчитайте среднюю зарплату по каждому отделу",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
INSERT INTO employees VALUES (1, 'Alice', 60000, 'IT');
INSERT INTO employees VALUES (2, 'Bob', 40000, 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 55000, 'IT');
INSERT INTO employees VALUES (4, 'David', 45000, 'HR');
`,
    expectedOutput: "IT|57500\nHR|42500",
    solutionCode: `SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department ORDER BY department;`,
  },
  {
    id: "pg-intermediate-2",
    title: "JOIN двух таблиц",
    category: "JOIN",
    level: 5,
    description: "Выберите имена сотрудников и названия их отделов",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, department_id INTEGER);
CREATE TABLE departments (id INTEGER, name TEXT);
INSERT INTO employees VALUES (1, 'Alice', 1);
INSERT INTO employees VALUES (2, 'Bob', 2);
INSERT INTO employees VALUES (3, 'Charlie', 1);
INSERT INTO departments VALUES (1, 'IT');
INSERT INTO departments VALUES (2, 'HR');
`,
    expectedOutput: "Alice|IT\nBob|HR\nCharlie|IT",
    solutionCode: `SELECT e.name, d.name FROM employees e JOIN departments d ON e.department_id = d.id;`,
  },
  {
    id: "pg-intermediate-3",
    title: "Подзапрос с MAX",
    category: "Подзапросы",
    level: 5,
    description: "Найдите сотрудника с максимальной зарплатой",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Alice', 60000);
INSERT INTO employees VALUES (2, 'Bob', 40000);
INSERT INTO employees VALUES (3, 'Charlie', 55000);
`,
    expectedOutput: "Alice|60000",
    solutionCode: `SELECT name, salary FROM employees WHERE salary = (SELECT MAX(salary) FROM employees);`,
  },
  // === ADVANCED ===
  {
    id: "pg-advanced-1",
    title: "Оконные функции",
    category: "Оконные функции",
    level: 7,
    description: "Добавьте ранг сотрудников по зарплате в каждом отделе",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
INSERT INTO employees VALUES (1, 'Alice', 60000, 'IT');
INSERT INTO employees VALUES (2, 'Bob', 40000, 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 55000, 'IT');
INSERT INTO employees VALUES (4, 'David', 45000, 'HR');
`,
    expectedOutput: "Alice|IT|60000|1\nCharlie|IT|55000|2\nDavid|HR|45000|1\nBob|HR|40000|2",
    solutionCode: `SELECT name, department, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank FROM employees ORDER BY department, rank;`,
  },
  {
    id: "pg-advanced-2",
    title: "CTE (Common Table Expression)",
    category: "CTE",
    level: 7,
    description: "Используйте CTE для нахождения отделов со средней зарплатой выше 50000",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
INSERT INTO employees VALUES (1, 'Alice', 60000, 'IT');
INSERT INTO employees VALUES (2, 'Bob', 40000, 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 55000, 'IT');
INSERT INTO employees VALUES (4, 'David', 45000, 'HR');
`,
    expectedOutput: "IT|57500",
    solutionCode: `WITH dept_avg AS (SELECT department, AVG(salary) as avg_sal FROM employees GROUP BY department) SELECT department, avg_sal FROM dept_avg WHERE avg_sal > 50000;`,
  },
  {
    id: "pg-advanced-3",
    title: "Создание представления",
    category: "Представления",
    level: 8,
    description: "Создайте представление high_earners для сотрудников с зарплатой > 50000",
    starterCode: `-- Напишите запрос ниже\n`,
    testCode: `
CREATE TABLE employees (id INTEGER, name TEXT, salary INTEGER, department TEXT);
INSERT INTO employees VALUES (1, 'Alice', 60000, 'IT');
INSERT INTO employees VALUES (2, 'Bob', 40000, 'HR');
INSERT INTO employees VALUES (3, 'Charlie', 55000, 'IT');
`,
    expectedOutput: "1|Alice|60000|IT\n3|Charlie|55000|IT",
    solutionCode: `CREATE VIEW high_earners AS SELECT * FROM employees WHERE salary > 50000;\nSELECT * FROM high_earners;`,
  },
];

// Apache Spark Topics
export interface SparkTopic {
  id: string;
  category: string;
  level: number;
  title: string;
  description: string;
  cheatSheet: string;
  theory: string;
  materials: { type: 'video' | 'article' | 'link'; title: string; url: string; description?: string }[];
  codeExamples: { title: string; code: string }[];
}

export const SPARK_TOPICS: SparkTopic[] = [
  {
    id: "spark-basics",
    category: "Spark",
    level: 1,
    title: "Основы Apache Spark",
    description: "SparkSession, RDD, DataFrame, базовые операции",
    cheatSheet: `# Создание SparkSession
from pyspark.sql import SparkSession
spark = SparkSession.builder.appName("MyApp").getOrCreate()

# Создание DataFrame
df = spark.createDataFrame([(1, "Alice"), (2, "Bob")], ["id", "name"])

# Чтение данных
df = spark.read.csv("file.csv", header=True, inferSchema=True)
df = spark.read.json("file.json")
df = spark.read.parquet("file.parquet")

# Базовые операции
df.show()           # Показать данные
df.printSchema()    # Показать схему
df.select("col")    # Выбрать столбцы
df.filter(df["age"] > 25)  # Фильтрация
df.groupBy("dept").count() # Группировка

# SQL
df.createOrReplaceTempView("people")
spark.sql("SELECT * FROM people WHERE age > 25")`,
    theory: `# Apache Spark - распределенная обработка больших данных

## SparkSession

Точка входа в Spark. Создается один раз на приложение.

\`\`\`python
from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .appName("MyApp") \\
    .master("local[*]") \\
    .getOrCreate()
\`\`\`

## DataFrame

Основная абстракция Spark - распределенная таблица.

\`\`\`python
# Создание
df = spark.createDataFrame([(1, "Alice"), (2, "Bob")], ["id", "name"])

# Чтение
df = spark.read.csv("data.csv", header=True)

# Запись
df.write.csv("output.csv")
\`\`\`

## Операции

- \`select()\` - выбор столбцов
- \`filter()\` или \`where()\` - фильтрация
- \`groupBy()\` - группировка
- \`orderBy()\` или \`sort()\` - сортировка
- \`join()\` - объединение DataFrames
- \`agg()\` - агрегация`,
    materials: [
      { type: "video", title: "Spark за 1 час", url: "https://www.youtube.com/watch?v=FhaqbEOuQ8U", description: "Введение в PySpark" },
      { type: "article", title: "Spark документация", url: "https://spark.apache.org/docs/latest/api/python/", description: "PySpark API" },
    ],
    codeExamples: [
      { title: "Создание DataFrame", code: `from pyspark.sql import SparkSession\n\nspark = SparkSession.builder.appName("Test").getOrCreate()\n\ndata = [(1, "Alice", 25), (2, "Bob", 30), (3, "Charlie", 35)]\ndf = spark.createDataFrame(data, ["id", "name", "age"])\n\ndf.show()\ndf.printSchema()` },
      { title: "Фильтрация и агрегация", code: `from pyspark.sql import functions as F\n\n# Фильтрация\ndf.filter(df["age"] > 25).show()\n\n# Группировка\ndf.groupBy("department").agg(\n    F.count("*").alias("count"),\n    F.avg("salary").alias("avg_salary")\n).show()` },
    ],
  },
  {
    id: "spark-sql",
    category: "Spark",
    level: 2,
    title: "Spark SQL",
    description: "SQL запросы к DataFrame, временные представления",
    cheatSheet: `# Регистрация временного представления
df.createOrReplaceTempView("employees")

# SQL запросы
result = spark.sql("""
    SELECT department, AVG(salary) as avg_salary
    FROM employees
    WHERE age > 25
    GROUP BY department
    ORDER BY avg_salary DESC
""")

# Окна
spark.sql("""
    SELECT name, salary, department,
           RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
    FROM employees
""")`,
    theory: `# Spark SQL

## Временные представления

\`\`\`python
# Временное (живет до конца сессии)
df.createOrReplaceTempView("temp_view")

# Глобальное временное (живет до остановки Spark)
df.createOrReplaceGlobalTempView("global_view")
\`\`\`

## SQL функции

Spark поддерживает большинство стандартных SQL функций:

- Агрегатные: \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`
- Строковые: \`CONCAT\`, \`SUBSTRING\`, \`UPPER\`, \`LOWER\`
- Дата/время: \`CURRENT_DATE\`, \`DATE_ADD\`, \`DATEDIFF\`
- Оконные: \`ROW_NUMBER\`, \`RANK\`, \`DENSE_RANK\`, \`LAG\`, \`LEAD\``,
    materials: [
      { type: "article", title: "Spark SQL Guide", url: "https://spark.apache.org/docs/latest/sql-programming-guide.html", description: "Полный гид по Spark SQL" },
    ],
    codeExamples: [
      { title: "SQL запросы", code: `df.createOrReplaceTempView("employees")\n\nresult = spark.sql("""\n    SELECT department, \n           COUNT(*) as emp_count,\n           AVG(salary) as avg_salary\n    FROM employees\n    GROUP BY department\n    ORDER BY avg_salary DESC\n""")\n\nresult.show()` },
    ],
  },
];

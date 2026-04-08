// Apache Airflow Topics
export interface AirflowTopic {
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

export const AIRFLOW_TOPICS: AirflowTopic[] = [
  {
    id: "airflow-basics",
    category: "Airflow",
    level: 1,
    title: "Основы Apache Airflow",
    description: "DAGs, Operators, Tasks, базовые концепции",
    cheatSheet: `# Базовая структура DAG
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

default_args = {
    'owner': 'airflow',
    'start_date': datetime(2024, 1, 1),
    'retries': 1,
}

dag = DAG(
    'my_dag',
    default_args=default_args,
    schedule_interval='@daily',
)

# Операторы
PythonOperator(task_id='task', python_callable=func, dag=dag)
BashOperator(task_id='bash_task', bash_command='echo hello', dag=dag)

# Зависимости
task1 >> task2 >> task3
task1.set_downstream(task2)`,
    theory: `# Apache Airflow - оркестрация workflows

## Основные концепции

**DAG (Directed Acyclic Graph)** - направленный ациклический граф, описывающий workflow.

**Operator** - шаблон для задачи (Python, Bash, SQL, и т.д.).

**Task** - экземпляр оператора в DAG.

**Task Instance** - конкретное выполнение задачи.

## Расписания

- \`@once\` - один раз
- \`@daily\` - каждый день
- \`@hourly\` - каждый час
- \`@weekly\` - каждую неделю
- Cron выражение: \`0 2 * * *\` (каждый день в 2:00)

## Операторы

- \`PythonOperator\` - выполнение Python функции
- \`BashOperator\` - выполнение bash команд
- \`PostgresOperator\` - SQL запросы к PostgreSQL
- \`EmailOperator\` - отправка email`,
    materials: [
      { type: "video", title: "Airflow Tutorial", url: "https://www.youtube.com/watch?v=Qgzk8rWYsMo", description: "Основы Apache Airflow" },
      { type: "article", title: "Airflow документация", url: "https://airflow.apache.org/docs/", description: "Официальная документация" },
    ],
    codeExamples: [
      { title: "Простой DAG", code: `from airflow import DAG\nfrom airflow.operators.python import PythonOperator\nfrom datetime import datetime\n\ndef hello():\n    print("Hello from Airflow!")\n\nwith DAG(\n    'hello_dag',\n    start_date=datetime(2024, 1, 1),\n    schedule_interval='@daily',\n) as dag:\n    \n    task = PythonOperator(\n        task_id='hello',\n        python_callable=hello,\n    )` },
    ],
  },
  {
    id: "airflow-operators",
    category: "Airflow",
    level: 2,
    title: "Операторы Airflow",
    description: "PythonOperator, BashOperator, BranchPythonOperator",
    cheatSheet: `# PythonOperator
PythonOperator(
    task_id='python_task',
    python_callable=my_function,
    op_kwargs={'arg1': 'value1'},
    dag=dag,
)

# BashOperator
BashOperator(
    task_id='bash_task',
    bash_command='echo "Hello"',
    dag=dag,
)

# BranchPythonOperator
BranchPythonOperator(
    task_id='branch',
    python_callable=choose_branch,
    dag=dag,
)

# Зависимости
task1 >> task2
task1 >> [task2, task3]`,
    theory: `# Операторы Airflow

## PythonOperator

Выполняет Python функцию.

\`\`\`python
def process_data(**kwargs):\n    ti = kwargs['ti']\n    data = ti.xcom_pull(task_ids='extract')\n    return process(data)\n\ntask = PythonOperator(\n    task_id='process',\n    python_callable=process_data,\n    provide_context=True,\n)\n\`\`\`

## XCom

Механизм обмена данными между задачами.

\`\`\`python
# Push
ti.xcom_push(key='data', value=my_data)

# Pull
data = ti.xcom_pull(task_ids='task1', key='data')
\`\`\``,
    materials: [
      { type: "article", title: "Airflow Operators Guide", url: "https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/index.html", description: "Полный гид по операторам" },
    ],
    codeExamples: [
      { title: "XCom пример", code: `from airflow.operators.python import PythonOperator\n\ndef extract(**kwargs):\n    ti = kwargs['ti']\n    data = [1, 2, 3]\n    ti.xcom_push(key='data', value=data)\n\ndef load(**kwargs):\n    ti = kwargs['ti']\n    data = ti.xcom_pull(task_ids='extract', key='data')\n    print(data)` },
    ],
  },
];

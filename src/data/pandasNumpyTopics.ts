// Pandas & Numpy Topics for Python
export interface PandasNumpyTopic {
  id: string;
  category: string;
  level: number;
  title: string;
  description: string;
  cheatSheet: string;
  theory: string;
  materials: { type: 'video' | 'article' | 'link'; title: string; url: string; description?: string }[];
  codeExamples: { title: string; code: string }[];
  tasks: { title: string; description: string; starterCode: string; expectedOutput: string; solution: string }[];
}

export const PANDAS_NUMPY_TOPICS: PandasNumpyTopic[] = [
  {
    id: "pandas-basics",
    category: "Pandas",
    level: 1,
    title: "Основы Pandas",
    description: "DataFrame, Series, чтение CSV, базовые операции",
    cheatSheet: `# Создание DataFrame
import pandas as pd
df = pd.DataFrame({'A': [1, 2], 'B': [3, 4]})

# Чтение данных
df = pd.read_csv('file.csv')
df = pd.read_excel('file.xlsx')

# Базовые операции
df.head()        # Первые 5 строк
df.info()        # Информация о DataFrame
df.describe()    # Статистика
df.shape         # Размеры (строки, столбцы)
df.columns       # Имена столбцов
df.dtypes        # Типы данных

# Выбор данных
df['column']     # Столбец
df[['A', 'B']]   # Несколько столбцов
df[0:5]          # Строки по индексу
df.loc[0]        # Строка по label
df.iloc[0]       # Строка по позиции

# Фильтрация
df[df['A'] > 1]
df[(df['A'] > 1) & (df['B'] < 4)]

# Сортировка
df.sort_values('A', ascending=False)`,
    theory: `# Pandas - библиотека для работы с табличными данными

## DataFrame и Series

**Series** - одномерный массив с метками (как столбец таблицы).
**DataFrame** - двумерная таблица с строками и столбцами.

## Создание DataFrame

\`\`\`python
import pandas as pd

# Из словаря
data = {'Name': ['Alice', 'Bob'], 'Age': [25, 30]}
df = pd.DataFrame(data)

# Из списка списков
df = pd.DataFrame([[1, 2], [3, 4]], columns=['A', 'B'])
\`\`\`

## Чтение данных

\`\`\`python
# CSV
df = pd.read_csv('data.csv')

# Excel
df = pd.read_excel('data.xlsx')

# JSON
df = pd.read_json('data.json')
\`\`\`

## Основные методы

- \`head(n)\` - первые n строк
- \`tail(n)\` - последние n строк
- \`info()\` - информация о DataFrame
- \`describe()\` - описательная статистика
- \`shape\` - кортеж (строки, столбцы)`,
    materials: [
      { type: "video", title: "Pandas за 1 час", url: "https://www.youtube.com/watch?v=vmEHCJofslg", description: "Полный курс по Pandas" },
      { type: "article", title: "Официальная документация Pandas", url: "https://pandas.pydata.org/docs/", description: "Документация библиотеки" },
    ],
    codeExamples: [
      { title: "Создание DataFrame", code: `import pandas as pd\n\ndata = {\n    'Name': ['Alice', 'Bob', 'Charlie'],\n    'Age': [25, 30, 35],\n    'City': ['Moscow', 'SPb', 'Moscow']\n}\n\ndf = pd.DataFrame(data)\nprint(df)` },
      { title: "Чтение CSV", code: `import pandas as pd\n\n# df = pd.read_csv('data.csv')\n# print(df.head())\n# print(df.info())` },
    ],
    tasks: [
      { title: "Создайте DataFrame", description: "Создайте DataFrame с данными о студентах", starterCode: `import pandas as pd\n\n# Создайте DataFrame с колонками: Name, Grade, Age\n`, expectedOutput: "  Name  Grade  Age\n0  Alice     90   20\n1    Bob     85   21", solution: `df = pd.DataFrame({'Name': ['Alice', 'Bob'], 'Grade': [90, 85], 'Age': [20, 21]})\nprint(df)` },
    ],
  },
  {
    id: "numpy-basics",
    category: "Numpy",
    level: 1,
    title: "Основы NumPy",
    description: "ndarray, создание массивов, математические операции",
    cheatSheet: `# Создание массивов
import numpy as np
arr = np.array([1, 2, 3])
zeros = np.zeros((3, 3))
ones = np.ones((2, 4))
range_arr = np.arange(0, 10, 2)
random = np.random.rand(3, 3)

# Свойства
arr.shape      # Форма массива
arr.ndim       # Количество измерений
arr.dtype      # Тип данных
arr.size       # Количество элементов

# Операции
arr + 10       # Добавление ко всем элементам
arr * 2        # Умножение
arr1 + arr2    # Поэлементное сложение
arr1 @ arr2    # Матричное умножение

# Агрегация
arr.sum()
arr.mean()
arr.max()
arr.min()
arr.std()      # Стандартное отклонение

# Индексация
arr[0]         # Первый элемент
arr[0:2]       # Срез
arr[arr > 2]   # Фильтрация`,
    theory: `# NumPy - библиотека для численных вычислений

## ndarray

Основной объект NumPy - многомерный массив (ndarray).

## Создание массивов

\`\`\`python
import numpy as np

# Из списка
arr = np.array([1, 2, 3, 4, 5])

# Нули и единицы
zeros = np.zeros((3, 3))  # 3x3 матрица нулей
ones = np.ones((2, 4))    # 2x4 матрица единиц

# Диапазоны
range_arr = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
linspace = np.linspace(0, 1, 5)  # 5 точек от 0 до 1

# Случайные числа
random = np.random.rand(3, 3)    # Равномерное распределение
normal = np.random.randn(3, 3)   # Нормальное распределение
\`\`\`

## Математические операции

Все операции выполняются поэлементно и очень быстро благодаря векторизации.`,
    materials: [
      { type: "video", title: "NumPy за 30 минут", url: "https://www.youtube.com/watch?v=QUT1VHiLmmI", description: "Быстрый старт с NumPy" },
      { type: "article", title: "NumPy документация", url: "https://numpy.org/doc/", description: "Официальная документация" },
    ],
    codeExamples: [
      { title: "Создание массивов", code: `import numpy as np\n\narr = np.array([1, 2, 3, 4, 5])\nprint(f"Массив: {arr}")\nprint(f"Форма: {arr.shape}")\nprint(f"Тип: {arr.dtype}")` },
      { title: "Математические операции", code: `import numpy as np\n\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\n\nprint(f"Сумма: {a + b}")\nprint(f"Произведение: {a * b}")\nprint(f"Среднее: {a.mean()}")` },
    ],
    tasks: [
      { title: "Создайте массив", description: "Создайте массив из 5 элементов и найдите сумму", starterCode: `import numpy as np\n\n# Создайте массив и найдите сумму\n`, expectedOutput: "Сумма: 15", solution: `arr = np.array([1, 2, 3, 4, 5])\nprint(f"Сумма: {arr.sum()}")` },
    ],
  },
];

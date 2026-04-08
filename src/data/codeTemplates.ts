// Шаблоны кода для быстрого старта
export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  category: "basics" | "algorithms" | "data-structures" | "oop" | "web" | "data-science";
  language: string;
  code: string;
  tags: string[];
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  // Basics
  {
    id: "hello-world",
    title: "Hello World",
    description: "Базовая программа вывода текста",
    category: "basics",
    language: "python",
    code: `# Hello World
print("Hello, World!")

# Ввод данных
name = input("Введите ваше имя: ")
print(f"Привет, {name}!")`,
    tags: ["basic", "input", "output"],
  },
  {
    id: "variables-types",
    title: "Переменные и типы",
    description: "Примеры работы с переменными",
    category: "basics",
    language: "python",
    code: `# Числа
age = 25
price = 19.99

# Строки
name = "Alice"
message = 'Hello'

# Списки
fruits = ["apple", "banana", "cherry"]

# Словари
person = {"name": "Alice", "age": 25}

# Вывод типов
print(type(age))    # <class 'int'>
print(type(price))  # <class 'float'>
print(type(name))   # <class 'str'>`,
    tags: ["variables", "types", "basics"],
  },
  {
    id: "if-else",
    title: "Условные операторы",
    description: "Примеры if/elif/else",
    category: "basics",
    language: "python",
    code: `# Простое условие
age = 18

if age < 13:
    print("Ребенок")
elif age < 18:
    print("Подросток")
else:
    print("Взрослый")

# Тернарный оператор
status = "совершеннолетний" if age >= 18 else "несовершеннолетний"
print(status)

# Логические операторы
if age >= 18 and age <= 65:
    print("Работоспособный возраст")`,
    tags: ["if", "else", "conditions"],
  },
  {
    id: "loops",
    title: "Циклы",
    description: "Примеры for и while циклов",
    category: "basics",
    language: "python",
    code: `# Цикл for
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Перебор списка
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# С индексом
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# Цикл while
count = 0
while count < 5:
    print(count)
    count += 1

# break и continue
for i in range(10):
    if i == 5:
        break  # Выход из цикла
    if i % 2 == 0:
        continue  # Пропуск итерации
    print(i)`,
    tags: ["for", "while", "loops"],
  },

  // Algorithms
  {
    id: "binary-search",
    title: "Бинарный поиск",
    description: "Алгоритм бинарного поиска в отсортированном массиве",
    category: "algorithms",
    language: "python",
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1  # Элемент не найден

# Пример использования
arr = [1, 3, 5, 7, 9, 11, 13, 15]
target = 7
result = binary_search(arr, target)
print(f"Элемент {target} найден на позиции: {result}")`,
    tags: ["search", "binary", "algorithms"],
  },
  {
    id: "bubble-sort",
    title: "Сортировка пузырьком",
    description: "Простой алгоритм сортировки",
    category: "algorithms",
    language: "python",
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Пример использования
arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = bubble_sort(arr.copy())
print(f"Оригинал: {arr}")
print(f"Отсортировано: {sorted_arr}")`,
    tags: ["sort", "bubble", "algorithms"],
  },
  {
    id: "fibonacci",
    title: "Числа Фибоначчи",
    description: "Рекурсивное и итеративное вычисление",
    category: "algorithms",
    language: "python",
    code: `# Рекурсивное решение
def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)

# С мемоизацией
def fibonacci_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

# Итеративное решение
def fibonacci_iterative(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Пример использования
n = 10
print(f"Рекурсия: {fibonacci_recursive(n)}")
print(f"Мемоизация: {fibonacci_memo(n)}")
print(f"Итерация: {fibonacci_iterative(n)}")`,
    tags: ["fibonacci", "recursion", "memoization"],
  },

  // Data Structures
  {
    id: "stack",
    title: "Стек",
    description: "Реализация стека на Python",
    category: "data-structures",
    language: "python",
    code: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None
    
    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)

# Пример использования
stack = Stack()
stack.push(1)
stack.push(2)
stack.push(3)
print(f"Верхний элемент: {stack.peek()}")  # 3
print(f"Удалён: {stack.pop()}")  # 3
print(f"Размер: {stack.size()}")  # 2`,
    tags: ["stack", "data-structure"],
  },
  {
    id: "queue",
    title: "Очередь",
    description: "Реализация очереди на Python",
    category: "data-structures",
    language: "python",
    code: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, item):
        self.items.append(item)
    
    def dequeue(self):
        if not self.is_empty():
            return self.items.popleft()
        return None
    
    def front(self):
        if not self.is_empty():
            return self.items[0]
        return None
    
    def is_empty(self):
        return len(self.items) == 0
    
    def size(self):
        return len(self.items)

# Пример использования
queue = Queue()
queue.enqueue(1)
queue.enqueue(2)
queue.enqueue(3)
print(f"Первый элемент: {queue.front()}")  # 1
print(f"Удалён: {queue.dequeue()}")  # 1
print(f"Размер: {queue.size()}")  # 2`,
    tags: ["queue", "data-structure"],
  },
  {
    id: "linked-list",
    title: "Связный список",
    description: "Реализация односвязного списка",
    category: "data-structures",
    language: "python",
    code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        print(" -> ".join(map(str, elements)))

# Пример использования
ll = LinkedList()
ll.append(1)
ll.append(2)
ll.append(3)
ll.display()  # 1 -> 2 -> 3`,
    tags: ["linked-list", "data-structure"],
  },

  // OOP
  {
    id: "class-basics",
    title: "Основы классов",
    description: "Базовый пример ООП",
    category: "oop",
    language: "python",
    code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, I'm {self.name}"
    
    def __str__(self):
        return f"{self.name}, {self.age} лет"

# Наследование
class Student(Person):
    def __init__(self, name, age, grade):
        super().__init__(name, age)
        self.grade = grade
    
    def study(self):
        return f"{self.name} изучает Python"

# Пример использования
person = Person("Alice", 25)
print(person.greet())
print(person)

student = Student("Bob", 20, "A")
print(student.study())`,
    tags: ["class", "oop", "inheritance"],
  },

  // Web
  {
    id: "http-requests",
    title: "HTTP запросы",
    description: "Примеры работы с requests",
    category: "web",
    language: "python",
    code: `import requests

# GET запрос
response = requests.get("https://api.example.com/data")
print(f"Status: {response.status_code}")
print(f"Data: {response.json()}")

# POST запрос
data = {"name": "Alice", "age": 25}
response = requests.post("https://api.example.com/users", json=data)
print(f"Created: {response.json()}")

# Обработка ошибок
try:
    response = requests.get("https://api.example.com/data")
    response.raise_for_status()
    print(response.json())
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")`,
    tags: ["http", "requests", "web"],
  },

  // Data Science
  {
    id: "numpy-basics",
    title: "Основы NumPy",
    description: "Базовые операции с массивами",
    category: "data-science",
    language: "python",
    code: `import numpy as np

# Создание массивов
arr = np.array([1, 2, 3, 4, 5])
matrix = np.array([[1, 2], [3, 4]])

# Операции
print(f"Сумма: {np.sum(arr)}")
print(f"Среднее: {np.mean(arr)}")
print(f"Максимум: {np.max(arr)}")
print(f"Минимум: {np.min(arr)}")

# Матричные операции
print(f"Транспонирование:\\n{matrix.T}")
print(f"Умножение матриц:\\n{matrix @ matrix.T}")

# Генерация случайных чисел
random_arr = np.random.randn(5)
print(f"Случайные числа: {random_arr}")`,
    tags: ["numpy", "arrays", "data-science"],
  },
  {
    id: "pandas-basics",
    title: "Основы Pandas",
    description: "Работа с DataFrame",
    category: "data-science",
    language: "python",
    code: `import pandas as pd

# Создание DataFrame
data = {
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['Moscow', 'SPb', 'Kazan']
}
df = pd.DataFrame(data)

# Основные операции
print(df.head())
print(df.describe())
print(df['age'].mean())

# Фильтрация
adults = df[df['age'] > 25]
print(adults)

# Группировка
grouped = df.groupby('city').mean()
print(grouped)`,
    tags: ["pandas", "dataframe", "data-science"],
  },
];

// Helper functions
export function getTemplatesByCategory(category: string): CodeTemplate[] {
  return CODE_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(query: string): CodeTemplate[] {
  const lowerQuery = query.toLowerCase();
  return CODE_TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getCategories(): string[] {
  return [...new Set(CODE_TEMPLATES.map(t => t.category))];
}

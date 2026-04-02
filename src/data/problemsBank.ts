// Банк задач с таймером (не ДЗ, просто задачи для практики)
export const PROBLEMS_BANK = [
  // === ЛЕГКИЕ ЗАДАЧИ ===
  {
    id: "prob-easy-1",
    title: "Сумма цифр числа",
    difficulty: "easy",
    category: "Математика",
    description: "Найдите сумму всех цифр заданного числа.",
    input: "Целое положительное число n",
    output: "Сумма цифр числа",
    examples: [
      { input: "123", output: "6" },
      { input: "456", output: "15" },
      { input: "999", output: "27" }
    ],
    starterCode: `def sum_of_digits(n):
    # Напишите функцию, которая возвращает сумму цифр числа n
    pass

# Пример использования:
# print(sum_of_digits(123))  # Должно вывести 6`,
    testCases: [
      { input: "123", expected: "6" },
      { input: "456", expected: "15" },
      { input: "999", expected: "27" },
      { input: "1000", expected: "1" }
    ],
    timeLimit: 300  // 5 минут
  },
  {
    id: "prob-easy-2",
    title: "Палиндром",
    difficulty: "easy",
    category: "Строки",
    description: "Проверьте, является ли строка палиндромом (читается одинаково в обе стороны).",
    input: "Строка s",
    output: "True или False",
    examples: [
      { input: "aba", output: "True" },
      { input: "abc", output: "False" },
      { input: "racecar", output: "True" }
    ],
    starterCode: `def is_palindrome(s):
    # Напишите функцию, которая проверяет, является ли строка палиндромом
    pass`,
    testCases: [
      { input: "'aba'", expected: "True" },
      { input: "'abc'", expected: "False" },
      { input: "'racecar'", expected: "True" },
      { input: "'hello'", expected: "False" }
    ],
    timeLimit: 300
  },
  {
    id: "prob-easy-3",
    title: "Максимальный элемент списка",
    difficulty: "easy",
    category: "Списки",
    description: "Найдите максимальный элемент в списке без использования функции max().",
    input: "Список чисел arr",
    output: "Максимальное число",
    examples: [
      { input: "[1, 5, 3, 9, 2]", output: "9" },
      { input: "[-1, -5, -3]", output: "-1" }
    ],
    starterCode: `def find_max(arr):
    # Найдите максимальный элемент без использования max()
    pass`,
    testCases: [
      { input: "[1, 5, 3, 9, 2]", expected: "9" },
      { input: "[-1, -5, -3]", expected: "-1" },
      { input: "[42]", expected: "42" },
      { input: "[0, 0, 0]", expected: "0" }
    ],
    timeLimit: 300
  },
  {
    id: "prob-easy-4",
    title: "Подсчет гласных",
    difficulty: "easy",
    category: "Строки",
    description: "Подсчитайте количество гласных букв в строке (a, e, i, o, u).",
    input: "Строка s",
    output: "Количество гласных",
    examples: [
      { input: "hello", output: "2" },
      { input: "world", output: "1" },
      { input: "aeiou", output: "5" }
    ],
    starterCode: `def count_vowels(s):
    # Подсчитайте количество гласных в строке
    pass`,
    testCases: [
      { input: "'hello'", expected: "2" },
      { input: "'world'", expected: "1" },
      { input: "'aeiou'", expected: "5" },
      { input: "'xyz'", expected: "0" }
    ],
    timeLimit: 300
  },
  // === СРЕДНИЕ ЗАДАЧИ ===
  {
    id: "prob-medium-1",
    title: "Сортировка пузырьком",
    difficulty: "medium",
    category: "Алгоритмы",
    description: "Реализуйте алгоритм сортировки пузырьком.",
    input: "Список чисел arr",
    output: "Отсортированный список",
    examples: [
      { input: "[5, 2, 8, 1, 9]", output: "[1, 2, 5, 8, 9]" }
    ],
    starterCode: `def bubble_sort(arr):
    # Реализуйте сортировку пузырьком
    pass`,
    testCases: [
      { input: "[5, 2, 8, 1, 9]", expected: "[1, 2, 5, 8, 9]" },
      { input: "[1, 2, 3]", expected: "[1, 2, 3]" },
      { input: "[3, 2, 1]", expected: "[1, 2, 3]" },
      { input: "[5]", expected: "[5]" }
    ],
    timeLimit: 600  // 10 минут
  },
  {
    id: "prob-medium-2",
    title: "Поиск дубликатов",
    difficulty: "medium",
    category: "Списки",
    description: "Найдите все дубликаты в списке и верните их в виде списка.",
    input: "Список чисел arr",
    output: "Список дубликатов",
    examples: [
      { input: "[1, 2, 3, 2, 4, 3]", output: "[2, 3]" }
    ],
    starterCode: `def find_duplicates(arr):
    # Найдите все дубликаты в списке
    pass`,
    testCases: [
      { input: "[1, 2, 3, 2, 4, 3]", expected: "[2, 3]" },
      { input: "[1, 1, 1, 1]", expected: "[1]" },
      { input: "[1, 2, 3, 4]", expected: "[]" },
      { input: "[]", expected: "[]" }
    ],
    timeLimit: 600
  },
  {
    id: "prob-medium-3",
    title: "Числа Фибоначчи",
    difficulty: "medium",
    category: "Рекурсия",
    description: "Напишите функцию для вычисления n-го числа Фибоначчи с использованием мемоизации.",
    input: "Число n",
    output: "n-е число Фибоначчи",
    examples: [
      { input: "10", output: "55" }
    ],
    starterCode: `def fibonacci(n, memo={}):
    # Вычислите n-е число Фибоначчи с мемоизацией
    pass`,
    testCases: [
      { input: "0", expected: "0" },
      { input: "1", expected: "1" },
      { input: "10", expected: "55" },
      { input: "20", expected: "6765" }
    ],
    timeLimit: 600
  },
  {
    id: "prob-medium-4",
    title: "Группировка анаграмм",
    difficulty: "medium",
    category: "Словари",
    description: "Сгруппируйте анаграммы вместе. Анаграммы - это слова, состоящие из одних и тех же букв.",
    input: "Список строк words",
    output: "Список списков с анаграммами",
    examples: [
      { input: "['eat', 'tea', 'tan', 'ate', 'nat', 'bat']", output: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]" }
    ],
    starterCode: `def group_anagrams(words):
    # Сгруппируйте анаграммы
    pass`,
    testCases: [
      { input: "['eat', 'tea', 'tan', 'ate', 'nat', 'bat']", expected: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]" }
    ],
    timeLimit: 900  // 15 минут
  },
  // === СЛОЖНЫЕ ЗАДАЧИ ===
  {
    id: "prob-hard-1",
    title: "Поиск пути в лабиринте",
    difficulty: "hard",
    category: "Алгоритмы",
    description: "Найдите путь в лабиринте от старта (S) до финиша (F). Используйте BFS или DFS.",
    input: "Двумерный массив, где 0 - путь, 1 - стена, S - старт, F - финиш",
    output: "Список координат пути или None если пути нет",
    examples: [
      { input: "[['S', 0, 0], [1, 1, 0], [0, 0, 'F']]", output: "[(0,0), (0,1), (0,2), (1,2), (2,2)]" }
    ],
    starterCode: `def find_path(maze):
    # Найдите путь от S до F
    # Верните список кортежей (row, col) или None
    pass`,
    testCases: [],
    timeLimit: 1800  // 30 минут
  },
  {
    id: "prob-hard-2",
    title: "LRU Кэш",
    difficulty: "hard",
    category: "Структуры данных",
    description: "Реализуйте LRU (Least Recently Used) кэш с методами get и put.",
    input: "Максимальный размер кэша capacity",
    output: "Класс LRUCache с методами get(key) и put(key, value)",
    examples: [
      { input: "cache = LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1); cache.put(3, 3); cache.get(2)", output: "1, None" }
    ],
    starterCode: `class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        # Ваш код здесь
        pass
    
    def get(self, key):
        # Верните значение или -1 если ключа нет
        pass
    
    def put(self, key, value):
        # Добавьте или обновите значение
        pass`,
    testCases: [],
    timeLimit: 1800
  },
  {
    id: "prob-hard-3",
    title: "Валидация скобочной последовательности",
    difficulty: "hard",
    category: "Стек",
    description: "Проверьте, является ли скобочная последовательность правильной. Поддерживаются (), [], {}.",
    input: "Строка s с скобками",
    output: "True или False",
    examples: [
      { input: "'()[]{}'", output: "True" },
      { input: "'([{}])'", output: "True" },
      { input: "'([)]'", output: "False" }
    ],
    starterCode: `def is_valid_brackets(s):
    # Проверьте правильность скобочной последовательности
    pass`,
    testCases: [
      { input: "'()'", expected: "True" },
      { input: "'()[]{}'", expected: "True" },
      { input: "'([{}])'", expected: "True" },
      { input: "'([)]'", expected: "False" },
      { input: "'((('", expected: "False" }
    ],
    timeLimit: 900
  }
];

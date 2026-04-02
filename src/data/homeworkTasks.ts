// Домашние задания с автоматической проверкой по ВЫВОДУ
export const HOMEWORK_TASKS = [
  // === БАЗОВЫЙ УРОВЕНЬ ===
  {
    id: "hw-basics-1",
    title: "Работа с типами данных",
    category: "Основы",
    level: 1,
    description: "Создайте переменные разных типов и выведите их",
    task: `1. Создайте переменную age типа int со значением 25
2. Создайте переменную price типа float со значением 19.99
3. Создайте переменную name типа str со значением "Alice"
4. Создайте переменную hobbies типа list с тремя элементами
5. Выведите все переменные через print()`,
    starterCode: `# Создайте переменные ниже:

`,
    expectedOutput: `age: 25
price: 19.99
name: Alice
hobbies: ['reading', 'gaming', 'coding']`,
    solutionCode: `age = 25
price = 19.99
name = "Alice"
hobbies = ["reading", "gaming", "coding"]

print(f"age: {age}")
print(f"price: {price}")
print(f"name: {name}")
print(f"hobbies: {hobbies}")`,
  },
  {
    id: "hw-basics-2",
    title: "Функция для работы со строками",
    category: "Основы",
    level: 2,
    description: "Напишите функцию для обработки строки",
    task: `Напишите функцию analyze_text(text), которая:
1. Возвращает количество слов в тексте
2. Возвращает текст в верхнем регистре
3. Возвращает True, если текст начинается с заглавной буквы

Функция должна возвращать кортеж: (word_count, upper_text, starts_with_capital)`,
    starterCode: `def analyze_text(text):
    # Ваш код здесь
    pass

# Пример использования:
# result = analyze_text("Hello world this is a test")
# print(result)`,
    testCode: `# Проверка
result = analyze_text("Hello world this is a test")
assert isinstance(result, tuple), "Должен возвращать кортеж"
assert len(result) == 3, "Должен возвращать 3 значения"
assert result[0] == 6, f"Количество слов должно быть 6, получено {result[0]}"
assert result[1] == "HELLO WORLD THIS IS A TEST", "Верхний регистр неверен"
assert result[2] == True, "Должно начинаться с заглавной"

result2 = analyze_text("hello world")
assert result2[2] == False, "Должно быть False для строчной буквы"

print("Тесты пройдены!")
print(f"Пример: analyze_text('Hello world') = {analyze_text('Hello world')}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!\nПример: analyze_text('Hello world') = (2, 'HELLO WORLD', True)\nTESTS_PASSED"
  },
  {
    id: "hw-basics-3",
    title: "Словарь и статистика",
    category: "Основы",
    level: 3,
    description: "Создайте функцию для подсчета символов",
    task: `Напишите функцию char_stats(text), которая возвращает словарь,
где ключи - символы, а значения - количество их вхождений в текст.

Пример: char_stats("hello") → {'h': 1, 'e': 1, 'l': 2, 'o': 1}`,
    starterCode: `def char_stats(text):
    # Ваш код здесь
    pass`,
    testCode: `# Проверка
result = char_stats("hello")
assert result == {'h': 1, 'e': 1, 'l': 2, 'o': 1}, f"Неверный результат: {result}"

result2 = char_stats("")
assert result2 == {}, "Пустая строка должна вернуть пустой словарь"

result3 = char_stats("aaa")
assert result3 == {'a': 3}, "Должно считать повторения"

print("Тесты пройдены!")
print(f"char_stats('programming') = {char_stats('programming')}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!\nchar_stats('programming') = "
  },
  // === СРЕДНИЙ УРОВЕНЬ ===
  {
    id: "hw-intermediate-1",
    title: "Фильтрация списка",
    category: "Средний уровень",
    level: 4,
    description: "Функция для фильтрации чисел",
    task: `Напишите функцию filter_numbers(numbers, min_val, max_val),
которая возвращает новый список с числами в диапазоне [min_val, max_val].

Используйте list comprehension.`,
    starterCode: `def filter_numbers(numbers, min_val, max_val):
    # Ваш код здесь
    pass`,
    testCode: `# Проверка
result = filter_numbers([1, 5, 10, 15, 20], 5, 15)
assert result == [5, 10, 15], f"Неверный результат: {result}"

result2 = filter_numbers([1, 2, 3], 5, 10)
assert result2 == [], "Должен вернуть пустой список"

result3 = filter_numbers([], 1, 10)
assert result3 == [], "Пустой список должен остаться пустым"

print("Тесты пройдены!")
print(f"filter_numbers([1,2,3,4,5,6,7,8,9,10], 3, 7) = {filter_numbers([1,2,3,4,5,6,7,8,9,10], 3, 7)}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!\nfilter_numbers([1,2,3,4,5,6,7,8,9,10], 3, 7) = [3, 4, 5, 6, 7]\nTESTS_PASSED"
  },
  {
    id: "hw-intermediate-2",
    title: "Рекурсивный факториал с кэшем",
    category: "Средний уровень",
    level: 5,
    description: "Рекурсивная функция с мемоизацией",
    task: `Напишите рекурсивную функцию factorial(n, cache={}),
которая вычисляет факториал числа n с использованием кэша.

factorial(5) = 5! = 120`,
    starterCode: `def factorial(n, cache={}):
    # Ваш код здесь
    pass`,
    testCode: `# Проверка
assert factorial(0) == 1, "0! = 1"
assert factorial(1) == 1, "1! = 1"
assert factorial(5) == 120, "5! = 120"
assert factorial(10) == 3628800, "10! = 3628800"

print("Тесты пройдены!")
for i in range(6):
    print(f"{i}! = {factorial(i)}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!\n0! = 1\n1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\nTESTS_PASSED"
  },
  {
    id: "hw-intermediate-3",
    title: "Генератор простых чисел",
    category: "Средний уровень",
    level: 6,
    description: "Функция для нахождения простых чисел",
    task: `Напишите функцию get_primes(n), которая возвращает список
всех простых чисел от 2 до n включительно.

Простое число делится только на 1 и на само себя.`,
    starterCode: `def get_primes(n):
    # Ваш код здесь
    pass`,
    testCode: `# Проверка
assert get_primes(10) == [2, 3, 5, 7], f"Неверно: {get_primes(10)}"
assert get_primes(2) == [2], "Должен содержать только 2"
assert get_primes(1) == [], "Нет простых чисел <= 1"
assert len(get_primes(100)) == 25, "До 100 должно быть 25 простых чисел"

print("Тесты пройдены!")
print(f"Простые числа до 50: {get_primes(50)}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!\nПростые числа до 50: "
  },
  // === ПРОДВИНУТЫЙ УРОВЕНЬ ===
  {
    id: "hw-advanced-1",
    title: "Класс для работы с матрицами",
    category: "Продвинутый",
    level: 7,
    description: "Создайте класс Matrix с базовыми операциями",
    task: `Создайте класс Matrix с методами:
1. __init__(self, data) - инициализация двумерным списком
2. __str__(self) - строковое представление
3. __add__(self, other) - сложение матриц
4. __mul__(self, scalar) - умножение на скаляр
5. transpose() - транспонирование`,
    starterCode: `class Matrix:
    def __init__(self, data):
        self.data = data
    
    def __str__(self):
        # Ваш код
        pass
    
    def __add__(self, other):
        # Ваш код
        pass
    
    def __mul__(self, scalar):
        # Ваш код
        pass
    
    def transpose(self):
        # Ваш код
        pass`,
    testCode: `# Проверка
m1 = Matrix([[1, 2], [3, 4]])
m2 = Matrix([[5, 6], [7, 8]])

# Сложение
m3 = m1 + m2
assert m3.data == [[6, 8], [10, 12]], f"Сложение неверно: {m3.data}"

# Уножение на скаляр
m4 = m1 * 2
assert m4.data == [[2, 4], [6, 8]], f"Умножение неверно: {m4.data}"

# Транспонирование
m5 = m1.transpose()
assert m5.data == [[1, 3], [2, 4]], f"Транспонирование неверно: {m5.data}"

print("Тесты пройдены!")
print(f"m1 =\\n{m1}")
print(f"m2 =\\n{m2}")
print(f"m1 + m2 =\\n{m1 + m2}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!"
  },
  {
    id: "hw-advanced-2",
    title: "Дескриптор для валидации",
    category: "Продвинутый",
    level: 8,
    description: "Создайте дескриптор для проверки типа и диапазона",
    task: `Создайте дескриптор ValidatedField, который:
1. Проверяет тип значения (type_)
2. Проверяет, что значение в диапазоне [min_val, max_val]
3. Вызывает TypeError или ValueError при нарушении`,
    starterCode: `class ValidatedField:
    def __init__(self, type_, min_val=None, max_val=None):
        self.type_ = type_
        self.min_val = min_val
        self.max_val = max_val
    
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, obj, objtype=None):
        # Ваш код
        pass
    
    def __set__(self, obj, value):
        # Ваш код
        pass

class Person:
    age = ValidatedField(int, min_val=0, max_val=150)
    score = ValidatedField(float, min_val=0.0, max_val=100.0)`,
    testCode: `# Проверка
p = Person()

# Корректные значения
p.age = 25
assert p.age == 25, "age должен быть 25"

p.score = 85.5
assert abs(p.score - 85.5) < 0.01, "score должен быть 85.5"

# Проверка границ
try:
    p.age = -1
    assert False, "Должна быть ошибка для отрицательного возраста"
except ValueError:
    pass

try:
    p.age = 200
    assert False, "Должна быть ошибка для возраста > 150"
except ValueError:
    pass

try:
    p.age = "not a number"
    assert False, "Должна быть ошибка для неверного типа"
except TypeError:
    pass

print("Тесты пройдены!")
print(f"Person.age = {p.age}, Person.score = {p.score}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!\nPerson.age = 25, Person.score = 85.5\nTESTS_PASSED"
  },
  {
    id: "hw-advanced-3",
    title: "Метакласс для синглтона",
    category: "Продвинутый",
    level: 9,
    description: "Создайте метакласс, реализующий паттерн Singleton",
    task: `Создайте метакласс SingletonMeta, который гарантирует,
что у класса будет только один экземпляр.

При повторном вызове конструктора должен возвращаться
тот же самый объект.`,
    starterCode: `class SingletonMeta(type):
    # Ваш код здесь
    pass

class Database(metaclass=SingletonMeta):
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self.data = {}
            self._initialized = True`,
    testCode: `# Проверка
db1 = Database()
db2 = Database()

assert db1 is db2, "Должен быть один экземпляр"

db1.data['key'] = 'value'
assert db2.data['key'] == 'value', "Данные должны быть общими"

print("Тесты пройдены!")
print(f"db1 id: {id(db1)}")
print(f"db2 id: {id(db2)}")
print(f"db1 is db2: {db1 is db2}")
print("TESTS_PASSED")`,
    expectedOutput: "Тесты пройдены!\ndb1 id:"
  }
];

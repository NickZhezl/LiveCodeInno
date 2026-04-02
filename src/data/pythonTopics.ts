// Python Topics - от простого к сложному с подробной теорией
export const PYTHON_TOPICS = [
  {
    id: "py-basics-1",
    category: "Основы",
    level: 1,
    title: "Типы данных",
    description: "Числа, строки, списки, словари, кортежи, множества",
    theory: `# Типы данных в Python

## 1. Числовые типы (Numeric Types)

### int - целые числа
\`\`\`python
age = 25
count = -10
big_number = 1_000_000  # Читаемость с подчёркиваниями
\`\`\`

### float - числа с плавающей точкой
\`\`\`python
price = 19.99
rate = 0.5
scientific = 1.5e3  # 1500.0
\`\`\`

### complex - комплексные числа
\`\`\`python
z = 3 + 4j
print(z.real)  # 3.0
print(z.imag)  # 4.0
\`\`\`

## 2. Строки (str)

Неизменяемая последовательность символов.

\`\`\`python
# Создание строк
name = "Alice"
message = 'Hello'
multiline = """Многострочная
строка"""

# Операции
full_name = "John" + " " + "Doe"  # Конкатенация
repeated = "Hi" * 3  # "HiHiHi"

# Индексация и срезы
text = "Hello World"
text[0]      # 'H'
text[-1]     # 'd'
text[0:5]    # 'Hello'
text[::-1]   # 'dlroW olleH' (разворот)

# Методы строк
text.lower()           # "hello world"
text.upper()           # "HELLO WORLD"
text.split()           # ["Hello", "World"]
text.replace("o", "0") # "Hell0 W0rld"
text.find("World")     # 6
text.startswith("He")  # True
text.strip()           # Удаление пробелов по краям
\`\`\`

## 3. Списки (list)

Изменяемая упорядоченная последовательность.

\`\`\`python
# Создание
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
nested = [[1, 2], [3, 4]]

# Доступ
numbers[0]      # 1
numbers[-1]     # 5 (последний)
numbers[1:3]    # [2, 3]

# Методы
numbers.append(6)        # Добавить в конец
numbers.insert(0, 0)     # Вставить по индексу
numbers.remove(3)        # Удалить элемент
popped = numbers.pop()   # Удалить последний
numbers.index(2)         # Найти индекс
numbers.count(2)         # Посчитать вхождения
numbers.sort()           # Сортировка
numbers.reverse()        # Разворот
len(numbers)             # Длина
\`\`\`

## 4. Кортежи (tuple)

Неизменяемая упорядоченная последовательность.

\`\`\`python
point = (10, 20)
single = (5,)  # Запятая обязательна!

# Распаковка
x, y = point

# Использование
def get_user():
    return ("Alice", 25, "Moscow")

name, age, city = get_user()
\`\`\`

## 5. Словари (dict)

Неупорядоченная коллекция пар ключ-значение.

\`\`\`python
# Создание
person = {"name": "Alice", "age": 25}

# Доступ
person["name"]        # "Alice"
person.get("age")     # 25
person.get("city", "Unknown")  # "Unknown"

# Изменение
person["age"] = 26           # Обновить
person["city"] = "Moscow"    # Добавить

# Методы
person.keys()    # dict_keys(['name', 'age', 'city'])
person.values()  # dict_values(['Alice', 26, 'Moscow'])
person.items()   # dict_items([...])

# Удаление
del person["city"]
age = person.pop("age")
\`\`\`

## 6. Множества (set)

Неупорядоченная коллекция уникальных элементов.

\`\`\`python
numbers = {1, 2, 3, 4, 5}

# Операции
a = {1, 2, 3}
b = {3, 4, 5}

a | b  # Объединение: {1, 2, 3, 4, 5}
a & b  # Пересечение: {3}
a - b  # Разность: {1, 2}
a ^ b  # Симметричная разность: {1, 2, 4, 5}

# Методы
numbers.add(6)
numbers.remove(3)
numbers.discard(10)  # Не вызывает ошибку

# Уникальные элементы
unique = list(set([1, 2, 2, 3, 3, 3]))  # [1, 2, 3]
\`\`\``,
    codeExamples: [
      {
        title: "Работа со строками",
        code: `text = "Hello, World!"
print(f"Длина: {len(text)}")
print(f"Верхний регистр: {text.upper()}")
print(f"Срез: {text[0:5]}")`
      },
      {
        title: "Списки и словари",
        code: `fruits = ["apple", "banana", "cherry"]
person = {"name": "Alice", "age": 25}

fruits.append("orange")
person["city"] = "Moscow"

print(f"Фрукты: {fruits}")
print(f"Информация: {person}")`
      }
    ],
    tasks: [
      {
        title: "Создайте переменные разных типов",
        description: "Создайте int, float, str, list и выведите их",
        starterCode: `# Создайте переменные:
# age (int) = 25
# price (float) = 19.99
# name (str) = "Alice"
# hobbies (list) = ["reading", "gaming", "coding"]

`,
        expectedOutput: `age: 25
price: 19.99
name: Alice
hobbies: ['reading', 'gaming', 'coding']`,
        solution: `age = 25
price = 19.99
name = "Alice"
hobbies = ["reading", "gaming", "coding"]

print(f"age: {age}")
print(f"price: {price}")
print(f"name: {name}")
print(f"hobbies: {hobbies}")`
      }
    ]
  },
  {
    id: "py-basics-2",
    category: "Основы",
    level: 2,
    title: "Управляющие конструкции",
    description: "if/else, циклы for/while, break/continue",
    theory: `# Управляющие конструкции

## 1. Условные операторы (if/elif/else)

\`\`\`python
age = 18

if age < 13:
    print("Ребенок")
elif age < 18:
    print("Подросток")
else:
    print("Взрослый")

# Тернарный оператор
status = "совершеннолетний" if age >= 18 else "несовершеннолетний"

# Логические операторы
if age >= 18 and age <= 65:
    print("Работоспособный возраст")

if age < 18 or age > 65:
    print("Не работает")

if not age < 0:
    print("Возраст корректен")
\`\`\`

## 2. Цикл for

\`\`\`python
# range() генерирует числа
for i in range(5):      # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 6):   # 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2):  # 0, 2, 4, 6, 8
    print(i)

# Перебор списка
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# С индексом (enumerate)
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# break и continue
for i in range(10):
    if i == 5:
        break    # Выход из цикла
    if i % 2 == 0:
        continue # Пропустить итерацию
    print(i)

# else в цикле (выполняется если не было break)
for i in range(5):
    print(i)
else:
    print("Цикл завершен")
\`\`\`

## 3. Цикл while

\`\`\`python
# Базовый цикл
count = 0
while count < 5:
    print(count)
    count += 1

# С break
while True:
    user_input = input("Введите 'quit': ")
    if user_input == "quit":
        break

# while с else
count = 0
while count < 5:
    print(count)
    count += 1
else:
    print("Цикл завершен")
\`\`\``,
    codeExamples: [
      {
        title: "Проверка условий",
        code: `age = 20
if age < 13:
    print("Ребенок")
elif age < 18:
    print("Подросток")
else:
    print("Взрослый")`
      },
      {
        title: "Цикл for",
        code: `for i in range(1, 6):
    print(f"Итерация {i}: {i**2}")`
      }
    ],
    tasks: [
      {
        title: "Проверка числа",
        description: "Напишите код, который проверяет число и выводит сообщение",
        starterCode: `number = 42

# Если число четное - вывести "Четное"
# Если нечетное - вывести "Нечетное"

`,
        expectedOutput: "Четное",
        solution: `number = 42
if number % 2 == 0:
    print("Четное")
else:
    print("Нечетное")`
      }
    ]
  },
  {
    id: "py-basics-3",
    category: "Основы",
    level: 3,
    title: "Функции",
    description: "Объявление, аргументы, return, lambda",
    theory: `# Функции

## 1. Объявление функций

\`\`\`python
# Базовая функция
def greet(name):
    return f"Hello, {name}!"

result = greet("Alice")  # "Hello, Alice!"

# Параметры по умолчанию
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")           # "Hello, Alice!"
greet("Alice", "Hi")     # "Hi, Alice!"

# Произвольное число аргументов
def sum_all(*args):
    return sum(args)

sum_all(1, 2, 3)  # 6

# Именованные аргументы
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25)
\`\`\`

## 2. Лямбда-функции

\`\`\`python
# Лямбда-функции (анонимные)
square = lambda x: x ** 2
square(5)  # 25

# С несколькими аргументами
add = lambda x, y: x + y
add(2, 3)  # 5

# Использование с map и filter
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))  # [1, 4, 9, 16, 25]
evens = list(filter(lambda x: x % 2 == 0, numbers))  # [2, 4]
\`\`\`

## 3. Область видимости

\`\`\`python
# Глобальная переменная
global_var = "I'm global"

def my_func():
    # Локальная переменная
    local_var = "I'm local"
    print(global_var)  # Доступна
    
my_func()
print(local_var)  # Ошибка! Не видна
\`\`\``,
    codeExamples: [
      {
        title: "Функция с параметрами",
        code: `def introduce(name, age, city="Unknown"):
    return f"{name}, {age} лет, из {city}"

print(introduce("Alice", 25))
print(introduce("Bob", 30, "Moscow"))`
      },
      {
        title: "Лямбда-функции",
        code: `numbers = [1, 2, 3, 4, 5]

# Квадраты
squares = list(map(lambda x: x**2, numbers))
print(f"Квадраты: {squares}")

# Только четные
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"Четные: {evens}")`
      }
    ],
    tasks: [
      {
        title: "Функция сложения",
        description: "Напишите функцию add(a, b) которая возвращает сумму",
        starterCode: `def add(a, b):
    # Ваш код здесь
    pass

# Проверка
print(add(2, 3))  # Должно вывести 5
`,
        expectedOutput: "5",
        solution: `def add(a, b):
    return a + b

print(add(2, 3))`
      }
    ]
  },
  {
    id: "py-oop-1",
    category: "ООП",
    level: 4,
    title: "Классы и объекты",
    description: "Основы ООП, атрибуты, методы, __init__",
    theory: `# Объектно-ориентированное программирование

## 1. Классы и объекты

\`\`\`python
class Person:
    # Атрибут класса (общий для всех)
    species = "Homo sapiens"
    
    def __init__(self, name, age):
        # Атрибуты экземпляра
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, I'm {self.name}"
    
    def __str__(self):
        return f"{self.name}, {self.age} лет"

# Создание объектов
alice = Person("Alice", 25)
bob = Person("Bob", 30)

print(alice.greet())  # "Hello, I'm Alice"
print(bob)            # "Bob, 30 лет"
\`\`\`

## 2. Наследование

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"

# Проверка типа
isinstance(Dog("Buddy"), Animal)  # True
isinstance(Dog("Buddy"), Dog)     # True
\`\`\`

## 3. Инкапсуляция

\`\`\`python
class BankAccount:
    def __init__(self, balance=0):
        self._balance = balance  # Защищённый атрибут
    
    def deposit(self, amount):
        self._balance += amount
        return f"Deposited {amount}"
    
    def get_balance(self):
        return self._balance
\`\`\`

## 4. Полиморфизм

\`\`\`python
class Shape:
    def area(self):
        pass

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h
    
    def area(self):
        return self.w * self.h

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    
    def area(self):
        return 3.14 * self.r ** 2

# Полиморфизм
shapes = [Rectangle(5, 10), Circle(7)]
for shape in shapes:
    print(f"Area: {shape.area()}")
\`\`\``,
    codeExamples: [
      {
        title: "Простой класс",
        code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, {self.name}!"

alice = Person("Alice", 25)
print(alice.greet())`
      },
      {
        title: "Наследование",
        code: `class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def bark(self):
        return f"{self.name} says Woof!"

dog = Dog("Buddy")
print(dog.bark())`
      }
    ],
    tasks: [
      {
        title: "Создайте класс",
        description: "Создайте класс Rectangle с методами для площади и периметра",
        starterCode: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        # Ваш код
        pass
    
    def perimeter(self):
        # Ваш код
        pass

rect = Rectangle(5, 10)
print(f"Area: {rect.area()}")
print(f"Perimeter: {rect.perimeter()}")
`,
        expectedOutput: `Area: 50
Perimeter: 30`,
        solution: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

rect = Rectangle(5, 10)
print(f"Area: {rect.area()}")
print(f"Perimeter: {rect.perimeter()}")`
      }
    ]
  },
  {
    id: "py-advanced-1",
    category: "Продвинутый",
    level: 5,
    title: "Декораторы",
    description: "Функции-обёртки, @decorator, functools.wraps",
    theory: `# Декораторы

## 1. Основы декораторов

Декоратор - это функция, которая принимает другую функцию и расширяет её поведение.

\`\`\`python
# Простой декоратор
def my_decorator(func):
    def wrapper():
        print("До вызова функции")
        func()
        print("После вызова функции")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# Вывод:
# До вызова функции
# Hello!
# После вызова функции
\`\`\`

## 2. Декораторы с аргументами

\`\`\`python
def decorator_with_args(func):
    def wrapper(*args, **kwargs):
        print("Аргументы:", args, kwargs)
        return func(*args, **kwargs)
    return wrapper

@decorator_with_args
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice", greeting="Hi")
\`\`\`

## 3. Декораторы с параметрами

\`\`\`python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("Hi!")

say_hi()
\`\`\`

## 4. functools.wraps

\`\`\`python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def say_hello():
    """Docstring"""
    print("Hello!")

print(say_hello.__name__)  # say_hello (не wrapper!)
\`\`\``,
    codeExamples: [
      {
        title: "Декоратор времени выполнения",
        code: `import time
from functools import wraps

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} выполнилась за {end-start:.4f}с")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)

slow_function()`
      },
      {
        title: "Декоратор повтора",
        code: `def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")`
      }
    ],
    tasks: [
      {
        title: "Декоратор логирования",
        description: "Создайте декоратор @logger, который выводит имя функции перед вызовом",
        starterCode: `def logger(func):
    def wrapper(*args, **kwargs):
        # Выведите имя функции
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@logger
def say_hello(name):
    print(f"Hello, {name}!")

say_hello("Alice")
`,
        expectedOutput: `Calling say_hello
Hello, Alice!`,
        solution: `def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@logger
def say_hello(name):
    print(f"Hello, {name}!")

say_hello("Alice")`
      }
    ]
  },
  {
    id: "py-advanced-2",
    category: "Продвинутый",
    level: 6,
    title: "Метаклассы",
    description: "Классы для создания классов, type, __new__, __init__",
    theory: `# Метаклассы

## 1. Что такое метакласс?

Метакласс - это класс, экземплярами которого являются другие классы.

\`\`\`python
# type - метакласс по умолчанию
class MyClass:
    pass

# Эквивалентно:
MyClass = type('MyClass', (), {})

# type принимает 3 аргумента:
# 1. Имя класса (строка)
# 2. Кортеж базовых классов
# 3. Словарь атрибутов и методов
\`\`\`

## 2. Создание метакласса

\`\`\`python
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self.data = {}
            self._initialized = True

db1 = Database()
db2 = Database()
db1 is db2  # True (один экземпляр)
\`\`\`

## 3. Валидация через метаклассы

\`\`\`python
class ValidatorMeta(type):
    def __new__(mcs, name, bases, attrs):
        # Проверяем наличие обязательных атрибутов
        if name != 'BaseModel':
            required = ['id', 'name']
            for attr in required:
                if attr not in attrs:
                    raise AttributeError(f"Missing: {attr}")
        return super().__new__(mcs, name, bases, attrs)

class BaseModel(metaclass=ValidatorMeta):
    pass

class User(BaseModel):
    id = None
    name = None
    email = None
\`\`\`

## 4. Методы метакласса

\`\`\`python
class Meta(type):
    def __new__(mcs, name, bases, attrs):
        # Создание класса
        attrs['added_by_meta'] = True
        return super().__new__(mcs, name, bases, attrs)
    
    def __init__(cls, name, bases, attrs):
        # Инициализация класса
        super().__init__(name, bases, attrs)
    
    def __call__(cls, *args, **kwargs):
        # Создание экземпляра
        print(f"Creating instance of {cls.__name__}")
        return super().__call__(*args, **kwargs)
\`\`\``,
    codeExamples: [
      {
        title: "Singleton метакласс",
        code: `class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Config(metaclass=SingletonMeta):
    def __init__(self):
        self.settings = {}

c1 = Config()
c2 = Config()
print(f"Same instance: {c1 is c2}")`
      },
      {
        title: "Автоматическое добавление атрибутов",
        code: `class AutoAttrMeta(type):
    def __new__(mcs, name, bases, attrs):
        attrs['created_at'] = '2024-01-01'
        attrs['version'] = '1.0'
        return super().__new__(mcs, name, bases, attrs)

class Model(metaclass=AutoAttrMeta):
    pass

print(f"Created: {Model.created_at}")
print(f"Version: {Model.version}")`
      }
    ],
    tasks: [
      {
        title: "Метакласс для подсчёта экземпляров",
        description: "Создайте метакласс InstanceCounter, который считает количество созданных экземпляров",
        starterCode: `class InstanceCounter(type):
    # Ваш код здесь
    pass

class MyClass(metaclass=InstanceCounter):
    pass

# Создаём экземпляры
a = MyClass()
b = MyClass()
c = MyClass()

print(f"Created: {MyClass.instance_count}")
`,
        expectedOutput: "Created: 3",
        solution: `class InstanceCounter(type):
    def __new__(mcs, name, bases, attrs):
        attrs['instance_count'] = 0
        return super().__new__(mcs, name, bases, attrs)
    
    def __call__(cls, *args, **kwargs):
        instance = super().__call__(*args, **kwargs)
        cls.instance_count += 1
        return instance

class MyClass(metaclass=InstanceCounter):
    pass

a = MyClass()
b = MyClass()
c = MyClass()

print(f"Created: {MyClass.instance_count}")`
      }
    ]
  },
  {
    id: "py-advanced-3",
    category: "Продвинутый",
    level: 7,
    title: "Дескрипторы",
    description: "__get__, __set__, __set_name__, валидация",
    theory: `# Дескрипторы

## 1. Основы дескрипторов

Дескриптор - это объект, который реализует методы __get__, __set__ или __delete__.

\`\`\`python
class Descriptor:
    def __get__(self, obj, objtype=None):
        print("Getting value")
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        print("Setting value")
        obj.__dict__[self.name] = value
    
    def __set_name__(self, owner, name):
        self.name = name

class Person:
    name = Descriptor()
    age = Descriptor()
    
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("Alice", 25)
print(p.name)  # "Alice"
p.age = 26
\`\`\`

## 2. Валидация через дескрипторы

\`\`\`python
class Typed(Descriptor):
    def __init__(self, type_):
        self.type = type_
    
    def __set__(self, obj, value):
        if not isinstance(value, self.type):
            raise TypeError(f"Expected {self.type.__name__}")
        super().__set__(obj, value)

class Positive(Descriptor):
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError("Must be positive")
        super().__set__(obj, value)

class Product:
    name = Typed(str)
    price = Typed(float)
    quantity = Positive()
    
    def __init__(self, name, price, quantity):
        self.name = name
        self.price = price
        self.quantity = quantity
\`\`\`

## 3. Property как дескриптор

\`\`\`python
class Circle:
    def __init__(self, radius):
        self._radius = radius
    
    @property
    def radius(self):
        return self._radius
    
    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value
    
    @property
    def area(self):
        return 3.14 * self._radius ** 2
\`\`\``,
    codeExamples: [
      {
        title: "Типизированный дескриптор",
        code: `class Typed:
    def __init__(self, type_):
        self.type = type_
    
    def __set_name__(self, owner, name):
        self.name = name
    
    def __set__(self, obj, value):
        if not isinstance(value, self.type):
            raise TypeError(f"{self.name} must be {self.type.__name__}")
        obj.__dict__[self.name] = value
    
    def __get__(self, obj, objtype=None):
        return obj.__dict__.get(self.name)

class Person:
    name = Typed(str)
    age = Typed(int)
    
    def __init__(self, name, age):
        self.name = name
        self.age = age

p = Person("Alice", 25)
print(f"{p.name}, {p.age}")`
      }
    ],
    tasks: [
      {
        title: "Дескриптор для строки",
        description: "Создайте дескриптор StringDescriptor, который проверяет что значение - строка и не пустая",
        starterCode: `class StringDescriptor:
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, obj, objtype=None):
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        # Проверка: строка и не пустая
        pass

class Person:
    name = StringDescriptor()
    
    def __init__(self, name):
        self.name = name

p = Person("Alice")
print(f"Name: {p.name}")
`,
        expectedOutput: "Name: Alice",
        solution: `class StringDescriptor:
    def __set_name__(self, owner, name):
        self.name = name
    
    def __get__(self, obj, objtype=None):
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        if not isinstance(value, str):
            raise TypeError("Must be a string")
        if not value.strip():
            raise ValueError("Cannot be empty")
        obj.__dict__[self.name] = value

class Person:
    name = StringDescriptor()
    
    def __init__(self, name):
        self.name = name

p = Person("Alice")
print(f"Name: {p.name}")`
      }
    ]
  }
];

// Поиск по темам
export function searchTopics(query: string) {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  for (const topic of PYTHON_TOPICS) {
    // Поиск в заголовке
    if (topic.title.toLowerCase().includes(lowerQuery)) {
      results.push({ ...topic, matchType: 'title' });
      continue;
    }
    
    // Поиск в описании
    if (topic.description.toLowerCase().includes(lowerQuery)) {
      results.push({ ...topic, matchType: 'description' });
      continue;
    }
    
    // Поиск в теории
    if (topic.theory.toLowerCase().includes(lowerQuery)) {
      results.push({ ...topic, matchType: 'theory' });
      continue;
    }
    
    // Поиск в категориях
    if (topic.category.toLowerCase().includes(lowerQuery)) {
      results.push({ ...topic, matchType: 'category' });
      continue;
    }
  }
  
  return results;
}

// Получить все домашние задания из тем
export function getAllTasksFromTopics() {
  const allTasks = [];
  for (const topic of PYTHON_TOPICS) {
    if (topic.tasks) {
      for (const task of topic.tasks) {
        allTasks.push({
          ...task,
          topicId: topic.id,
          topicTitle: topic.title,
          category: topic.category,
        });
      }
    }
  }
  return allTasks;
}

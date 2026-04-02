// Python Topics - от простого к сложному с подробной теорией, подсказками и материалами
export const PYTHON_TOPICS = [
  {
    id: "py-basics-1",
    category: "Основы",
    level: 1,
    title: "Типы данных",
    description: "Числа, строки, списки, словари, кортежи, множества",
    
    // Краткие подсказки (Cheat Sheet)
    cheatSheet: `# Числа (int, float)
age = 25          # int
price = 19.99     # float
result = 10 // 3  # 3 (целочисленное деление)
mod = 10 % 3      # 1 (остаток от деления)
power = 2 ** 3    # 8 (возведение в степень)

# Строки (str)
text = "Hello"
text[0]           # 'H' (первый символ)
text[1:4]         # 'ell' (срез)
text[::-1]        # 'olleH' (разворот)
len(text)         # 5 (длина)
text.upper()      # 'HELLO'
text.lower()      # 'hello'
text.split()      # ['Hello']
f"Value: {x}"     # f-string (подстановка)

# Списки (list) - ИЗМЕНЯЕМЫЕ
lst = [1, 2, 3]
lst.append(4)     # [1, 2, 3, 4]
lst.insert(0, 0)  # [0, 1, 2, 3, 4]
lst.remove(2)     # [0, 1, 3, 4]
lst.pop()         # удаляет последний
lst[0] = 10       # изменение элемента
len(lst)          # длина списка

# Кортежи (tuple) - НЕИЗМЕНЯЕМЫЕ
tpl = (1, 2, 3)
x, y, z = tpl     # распаковка
single = (5,)     # кортеж из 1 элемента

# Словари (dict)
dct = {"key": "value"}
dct["key"]        # доступ к значению
dct.get("key")    # безопасный доступ
dct.keys()        # все ключи
dct.values()      # все значения
dct.items()       # пары (ключ, значение)

# Множества (set) - уникальные элементы
st = {1, 2, 3}
st.add(4)         # добавить элемент
st.remove(2)      # удалить элемент
a | b             # объединение
a & b             # пересечение
a - b             # разность`,

    // Дополнительные материалы (ссылки, видео, статьи)
    materials: [
      {
        type: "video",
        title: "Python за 1 час - Типы данных",
        url: "https://www.youtube.com/watch?v=Z1Yd7upQsXY",
        description: "Полный курс по типам данных в Python"
      },
      {
        type: "article",
        title: "Официальная документация Python",
        url: "https://docs.python.org/3/library/stdtypes.html",
        description: "Встроенные типы данных Python"
      },
      {
        type: "link",
        title: "Python Tutor - Визуализация",
        url: "https://pythontutor.com/",
        description: "Визуальное выполнение кода по шагам"
      }
    ],

    // Подробная теория с объяснениями
    theory: `# Типы данных в Python

## Введение

Python - язык с **динамической типизацией**. Это означает, что вам не нужно объявлять тип переменной заранее - Python сам определяет его по значению.

## 1. Числовые типы (Numeric Types)

### Целые числа (int)

Целые числа используются для подсчёта, индексации и математических вычислений без дробной части.

**Особенности:**
- Неограниченный размер (может хранить очень большие числа)
- Поддерживает отрицательные числа
- Операции: +, -, *, /, // (целочисленное), % (остаток), ** (степень)

**Примеры:**
\`\`\`python
age = 25
negative = -10
big_number = 1_000_000  # Подчёркивания для читаемости
\`\`\`

### Числа с плавающей точкой (float)

Числа с дробной частью для точных вычислений.

**Особенности:**
- Могут быть неточными из-за способа хранения в памяти
- Используйте модуль \`decimal\` для финансовых вычислений

**Примеры:**
\`\`\`python
price = 19.99
rate = 0.5
scientific = 1.5e3  # 1500.0 (научная нотация)
\`\`\`

## 2. Строки (str)

Строки - это **неизменяемые** последовательности символов.

**Ключевые моменты:**
- Можно использовать одинарные или двойные кавычки
- Индексация начинается с 0
- Отрицательные индексы считаются с конца (-1 = последний символ)
- Нельзя изменить символ по индексу (создавайте новую строку)

**Основные операции:**
- \`text[0]\` - первый символ
- \`text[1:4]\` - срез (с 1 по 3 включительно)
- \`text[::-1]\` - разворот строки
- \`len(text)\` - длина строки

**Методы строк:**
- \`text.upper()\` / \`text.lower()\` - регистр
- \`text.strip()\` - удалить пробелы по краям
- \`text.split()\` - разбить на список
- \`text.replace(old, new)\` - замена
- \`text.find(sub)\` - найти подстроку
- \`text.startswith(prefix)\` - проверка начала

## 3. Списки (list)

Списки - **изменяемые** упорядоченные коллекции.

**Важно запомнить:**
- Можно изменять элементы после создания
- Могут содержать элементы разных типов
- Поддерживают вложенность (списки в списке)

**Основные операции:**
- \`lst.append(x)\` - добавить в конец
- \`lst.insert(i, x)\` - вставить по индексу
- \`lst.remove(x)\` - удалить элемент
- \`lst.pop()\` - удалить последний и вернуть
- \`lst.index(x)\` - найти индекс элемента
- \`lst.count(x)\` - посчитать вхождения
- \`lst.sort()\` - отсортировать
- \`lst.reverse()\` - разворот

## 4. Кортежи (tuple)

Кортежи - **неизменяемые** упорядоченные коллекции.

**Когда использовать:**
- Когда данные не должны изменяться
- Для возврата нескольких значений из функции
- Как ключи в словаре (только неизменяемые типы)

**Распаковка кортежей:**
\`\`\`python
x, y, z = (1, 2, 3)
first, *rest = [1, 2, 3, 4]  # first=1, rest=[2,3,4]
\`\`\`

## 5. Словари (dict)

Словари - неупорядоченные (до Python 3.7) / упорядоченные (Python 3.8+) коллекции пар ключ-значение.

**Особенности:**
- Ключи должны быть неизменяемыми (str, int, tuple)
- Значения могут быть любыми
- Быстрый доступ по ключу (O(1))

**Основные операции:**
- \`dct[key]\` - доступ к значению
- \`dct.get(key, default)\` - безопасный доступ
- \`dct.keys()\` - получить все ключи
- \`dct.values()\` - получить все значения
- \`dct.items()\` - пары (ключ, значение)

## 6. Множества (set)

Множества - неупорядоченные коллекции **уникальных** элементов.

**Когда использовать:**
- Удаление дубликатов из списка
- Проверка принадлежности (быстрее чем в списке)
- Математические операции (объединение, пересечение)

**Операции:**
- \`a | b\` - объединение
- \`a & b\` - пересечение
- \`a - b\` - разность
- \`a ^ b\` - симметричная разность`,

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
    
    cheatSheet: `# if/elif/else
if x > 10:
    print("Big")
elif x > 5:
    print("Medium")
else:
    print("Small")

# Тернарный оператор
status = "yes" if x > 0 else "no"

# Логические операторы
x > 5 and x < 10   # И (оба истинны)
x > 5 or x < 0     # ИЛИ (одно истинно)
not x > 5          # НЕ (инверсия)

# for цикл
for i in range(5):      # 0,1,2,3,4
    print(i)

for i in range(2, 6):   # 2,3,4,5
    print(i)

for i in range(0, 10, 2):  # 0,2,4,6,8
    print(i)

# Перебор списка
for item in [1, 2, 3]:
    print(item)

# С индексом
for i, item in enumerate(list):
    print(i, item)

# while цикл
while x < 10:
    x += 1

# break / continue
for i in range(10):
    if i == 5:
        break    # выход из цикла
    if i % 2 == 0:
        continue # пропуск итерации`,

    materials: [
      {
        type: "video",
        title: "Условия и циклы в Python",
        url: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ",
        description: "if/else, for, while - полный разбор"
      },
      {
        type: "article",
        title: "Control Flow в Python",
        url: "https://docs.python.org/3/tutorial/controlflow.html",
        description: "Официальная документация"
      }
    ],

    theory: `# Управляющие конструкции

## 1. Условные операторы (if/elif/else)

Условные операторы позволяют выполнять разный код в зависимости от условий.

**Синтаксис:**
\`\`\`python
if условие1:
    # выполняется если условие1 истинно
elif условие2:
    # выполняется если условие2 истинно
else:
    # выполняется если все условия ложны
\`\`\`

**Важные моменты:**
- Двоеточие \`:\` обязательно после условия
- Отступы (4 пробела) определяют блок кода
- \`elif\` можно использовать много раз
- \`else\` необязателен

**Логические операторы:**
- \`and\` - И (оба условия истинны)
- \`or\` - ИЛИ (хотя бы одно истинно)
- \`not\` - НЕ (инвертирует значение)

**Примеры условий:**
- \`x > 5\` - больше
- \`x < 5\` - меньше
- \`x == 5\` - равно (два знака!)
- \`x != 5\` - не равно
- \`x >= 5\` - больше или равно
- \`x in lst\` - содержится в списке

**Тернарный оператор:**
Короткая запись if-else в одну строку:
\`\`\`python
# Длинная форма
if x > 0:
    status = "positive"
else:
    status = "negative"

# Короткая форма
status = "positive" if x > 0 else "negative"
\`\`\`

## 2. Цикл for

Цикл \`for\` используется для перебора последовательностей.

**Функция range():**
- \`range(5)\` - числа от 0 до 4
- \`range(2, 6)\` - числа от 2 до 5
- \`range(0, 10, 2)\` - числа от 0 до 8 с шагом 2

**Перебор с индексом:**
\`\`\`python
fruits = ["apple", "banana", "cherry"]

# Обычный способ
for i in range(len(fruits)):
    print(f"{i}: {fruits[i]}")

# С помощью enumerate (лучше!)
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
\`\`\`

**break и continue:**
- \`break\` - немедленно завершает цикл
- \`continue\` - пропускает текущую итерацию

**else в цикле:**
Блок \`else\` выполняется если цикл завершился естественно (не через break):
\`\`\`python
for i in range(5):
    if i == 10:
        break
else:
    print("Цикл завершён без break")
\`\`\`

## 3. Цикл while

Цикл \`while\` выполняется пока условие истинно.

**Синтаксис:**
\`\`\`python
while условие:
    # код
\`\`\`

**Важно:**
- Убедитесь что условие станет ложным (иначе бесконечный цикл!)
- Обычно используется счётчик или флаг

**Пример:**
\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1  # Обязательно изменяем счётчик!
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
    
    cheatSheet: `# Объявление функции
def func_name(param1, param2):
    return result

# Вызов функции
result = func_name(arg1, arg2)

# Параметры по умолчанию
def greet(name="Guest"):
    return f"Hello, {name}!"

# Произвольное число аргументов
def sum_all(*args):
    return sum(args)

# Именованные аргументы
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# Лямбда-функции
square = lambda x: x ** 2
add = lambda x, y: x + y

# Использование с map/filter
squares = list(map(lambda x: x**2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))

# Область видимости
global_var = "global"

def func():
    local_var = "local"
    global global_var  # доступ к глобальной`,

    materials: [
      {
        type: "video",
        title: "Функции в Python за 30 минут",
        url: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
        description: "Полный гид по функциям"
      },
      {
        type: "article",
        title: "Defining Functions",
        url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions",
        description: "Официальная документация"
      },
      {
        type: "link",
        title: "Lambda Functions Guide",
        url: "https://realpython.com/python-lambda/",
        description: "Подробно о лямбда-функциях"
      }
    ],

    theory: `# Функции

## 1. Объявление функций

Функции - это именованные блоки кода, которые можно вызывать многократно.

**Синтаксис:**
\`\`\`python
def имя_функции(параметры):
    """Документация (docstring)"""
    # Тело функции
    return результат
\`\`\`

**Ключевые моменты:**
- \`def\` - ключевое слово для объявления
- Параметры перечисляются в скобках
- \`return\` возвращает значение (необязателен)
- Без return функция возвращает \`None\`

**Пример:**
\`\`\`python
def greet(name):
    """Приветствует пользователя по имени"""
    return f"Hello, {name}!"

result = greet("Alice")  # "Hello, Alice!"
\`\`\`

## 2. Параметры и аргументы

**Параметры по умолчанию:**
\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")           # "Hello, Alice!"
greet("Alice", "Hi")     # "Hi, Alice!"
\`\`\`

**Важно:** Параметры по умолчанию должны идти после обязательных!

**Произвольное число позиционных аргументов (*args):**
\`\`\`python
def sum_all(*args):
    """Принимает любое число аргументов"""
    return sum(args)

sum_all(1, 2, 3)      # 6
sum_all(1, 2, 3, 4, 5) # 15
\`\`\`

**Произвольное число именованных аргументов (**kwargs):**
\`\`\`python
def print_info(**kwargs):
    """Принимает именованные аргументы"""
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=25)
# name: Alice
# age: 25
\`\`\`

## 3. Лямбда-функции

Лямбда-функции - это анонимные (безымянные) функции в одну строку.

**Синтаксис:**
\`\`\`python
lambda параметры: выражение
\`\`\`

**Примеры:**
\`\`\`python
# Обычная функция
def square(x):
    return x ** 2

# Лямбда-функция (то же самое)
square = lambda x: x ** 2

square(5)  # 25
\`\`\`

**Когда использовать:**
- Короткие функции для map/filter/sorted
- Когда функция нужна только в одном месте

**С map():**
\`\`\`python
numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x**2, numbers))
# [1, 4, 9, 16, 25]
\`\`\`

**С filter():**
\`\`\`python
numbers = [1, 2, 3, 4, 5]
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 4]
\`\`\`

## 4. Область видимости

**Локальные переменные** - объявлены внутри функции, видны только там.

**Глобальные переменные** - объявлены вне функции, видны везде.

\`\`\`python
global_var = "I'm global"

def my_func():
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
    
    cheatSheet: `# Объявление класса
class ClassName:
    def __init__(self, param):
        self.attribute = param
    
    def method(self):
        return self.attribute

# Создание объекта
obj = ClassName(value)

# Доступ к атрибутам
obj.attribute
obj.method()

# Наследование
class Child(Parent):
    def __init__(self, param):
        super().__init__(param)
    
    def method(self):  # Переопределение
        return "New behavior"

# Проверка типа
isinstance(obj, ClassName)  # True
issubclass(Child, Parent)   # True

# Специальные методы
__init__   # конструктор
__str__    # строковое представление
__repr__   # официальное представление
__len__    # длина объекта
__add__    # операция сложения`,

    materials: [
      {
        type: "video",
        title: "ООП в Python за 1 час",
        url: "https://www.youtube.com/watch?v=Ej_02ICOIgs",
        description: "Классы, объекты, наследование"
      },
      {
        type: "article",
        title: "Classes in Python",
        url: "https://docs.python.org/3/tutorial/classes.html",
        description: "Официальная документация"
      },
      {
        type: "link",
        title: "Real Python OOP",
        url: "https://realpython.com/python3-object-oriented-programming/",
        description: "Подробный гид по ООП"
      }
    ],

    theory: `# Объектно-ориентированное программирование (ООП)

## 1. Классы и объекты

**Класс** - это шаблон для создания объектов.
**Объект** - это экземпляр класса.

**Синтаксис:**
\`\`\`python
class ClassName:
    """Документация класса"""
    
    def __init__(self, параметры):
        """Конструктор - вызывается при создании объекта"""
        self.attribute = параметры
    
    def method(self):
        """Метод - функция внутри класса"""
        return self.attribute
\`\`\`

**Ключевые моменты:**
- \`self\` - ссылка на текущий объект (всегда первый параметр)
- \`__init__\` - конструктор, вызывается автоматически
- Атрибуты экземпляра создаются через \`self.name\`

**Пример:**
\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, I'm {self.name}"

# Создание объектов
alice = Person("Alice", 25)
bob = Person("Bob", 30)

print(alice.greet())  # "Hello, I'm Alice"
print(bob.age)        # 30
\`\`\`

## 2. Наследование

Наследование позволяет создать новый класс на основе существующего.

**Синтаксис:**
\`\`\`python
class Parent:
    def method(self):
        return "Parent method"

class Child(Parent):
    def child_method(self):
        return "Child method"
\`\`\`

**Переопределение методов:**
\`\`\`python
class Animal:
    def speak(self):
        return "Some sound"

class Dog(Animal):
    def speak(self):  # Переопределяем метод родителя
        return "Woof!"

class Cat(Animal):
    def speak(self):
        return "Meow!"
\`\`\`

**Вызов метода родителя:**
\`\`\`python
class Child(Parent):
    def method(self):
        parent_result = super().method()
        return parent_result + " extended"
\`\`\`

## 3. Инкапсуляция

Инкапсуляция - сокрытие внутренних данных класса.

**Соглашения в Python:**
- \`name\` - публичный атрибут (доступен всем)
- \`_name\` - защищённый (для внутреннего использования)
- \`__name\` - приватный (доступен только внутри класса)

**Пример:**
\`\`\`python
class BankAccount:
    def __init__(self, balance=0):
        self._balance = balance  # Защищённый
    
    def deposit(self, amount):
        self._balance += amount
    
    def get_balance(self):
        return self._balance
\`\`\`

## 4. Полиморфизм

Полиморфизм - возможность использовать объекты разных классов через общий интерфейс.

**Пример:**
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

# Полиморфизм в действии
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
    
    cheatSheet: `# Простой декоратор
def my_decorator(func):
    def wrapper():
        print("До")
        func()
        print("После")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

# Декоратор с аргументами
def decorator_with_args(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# Декоратор с параметрами
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

# functools.wraps
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# Встроенные декораторы
@staticmethod    # метод без self
@classmethod     # метод с cls
@property        # getter`,

    materials: [
      {
        type: "video",
        title: "Python Decorators за 20 минут",
        url: "https://www.youtube.com/watch?v=FXUUSfJO_J4",
        description: "Полное руководство"
      },
      {
        type: "article",
        title: "Decorators in Python",
        url: "https://docs.python.org/3/glossary.html#term-decorator",
        description: "Официальная документация"
      },
      {
        type: "link",
        title: "Real Python Decorators",
        url: "https://realpython.com/primer-on-python-decorators/",
        description: "Подробный разбор с примерами"
      }
    ],

    theory: `# Декораторы

## 1. Что такое декоратор?

**Декоратор** - это функция, которая принимает другую функцию и расширяет её поведение, не изменяя саму функцию.

**Простыми словами:** Декоратор - это "обёртка" вокруг функции.

**Синтаксис:**
\`\`\`python
# Длинная форма
def my_decorator(func):
    def wrapper():
        print("До вызова функции")
        func()
        print("После вызова функции")
    return wrapper

def say_hello():
    print("Hello!")

say_hello = my_decorator(say_hello)

# Короткая форма (то же самое)
@my_decorator
def say_hello():
    print("Hello!")
\`\`\`

## 2. Как работает декоратор

**Шаг 1:** Декоратор принимает функцию как аргумент.

**Шаг 2:** Создаёт функцию-обёртку (wrapper).

**Шаг 3:** Возвращает обёртку вместо оригинальной функции.

**Пример с логированием:**
\`\`\`python
def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Вызов функции: {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Результат: {result}")
        return result
    return wrapper

@logger
def add(a, b):
    return a + b

add(2, 3)
# Вызов функции: add
# Результат: 5
\`\`\`

## 3. Декораторы с аргументами

Если декорируемая функция принимает аргументы, обёртка должна их передать:

\`\`\`python
def decorator(func):
    def wrapper(*args, **kwargs):
        # *args - позиционные аргументы
        # **kwargs - именованные аргументы
        return func(*args, **kwargs)
    return wrapper
\`\`\`

## 4. Декораторы с параметрами

Декоратор может сам принимать параметры:

\`\`\`python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")
# Hello, Alice!
# Hello, Alice!
# Hello, Alice!
\`\`\`

## 5. functools.wraps

Проблема: после декорирования функция теряет своё имя и документацию.

Решение: использовать \`@wraps(func)\`:

\`\`\`python
from functools import wraps

def my_decorator(func):
    @wraps(func)  # Сохраняет имя и документацию
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def say_hello():
    """Say hello"""
    print("Hello!")

print(say_hello.__name__)  # say_hello (не wrapper!)
print(say_hello.__doc__)   # Say hello
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
    
    cheatSheet: `# type - метакласс по умолчанию
class MyClass:
    pass

# Эквивалентно:
MyClass = type('MyClass', (), {})

# Создание метакласса
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    pass

# Валидация через метакласс
class ValidatorMeta(type):
    def __new__(mcs, name, bases, attrs):
        # Проверка перед созданием класса
        if 'required_attr' not in attrs:
            raise AttributeError("Missing required_attr")
        return super().__new__(mcs, name, bases, attrs)

# Методы метакласса
__new__    # создание класса
__init__   # инициализация класса
__call__   # создание экземпляра`,

    materials: [
      {
        type: "article",
        title: "Metaclasses in Python",
        url: "https://docs.python.org/3/reference/datamodel.html#metaclasses",
        description: "Официальная документация"
      },
      {
        type: "link",
        title: "Real Python Metaclasses",
        url: "https://realpython.com/python-metaclasses/",
        description: "Подробный разбор"
      }
    ],

    theory: `# Метаклассы

## 1. Что такое метакласс?

**Метакласс** - это класс, экземплярами которого являются другие классы.

**Простыми словами:**
- Обычный класс создаёт объекты
- Метакласс создаёт классы

**Иерархия:**
\`\`\`
Метакласс → Класс → Объект
\`\`\`

## 2. type - встроенный метакласс

\`type\` - это метакласс по умолчанию в Python.

**Создание класса через type:**
\`\`\`python
# Обычный способ
class MyClass:
    x = 5

# Эквивалентно через type
MyClass = type('MyClass', (), {'x': 5})

# type принимает 3 аргумента:
# 1. Имя класса (строка)
# 2. Кортеж базовых классов
# 3. Словарь атрибутов
\`\`\`

## 3. Создание собственного метакласса

Метакласс должен наследоваться от \`type\`:

\`\`\`python
class SingletonMeta(type):
    """Метакласс для паттерна Singleton"""
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        """Вызывается при создании экземпляра"""
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Database(metaclass=SingletonMeta):
    def __init__(self):
        self.data = {}

# Использование
db1 = Database()
db2 = Database()
print(db1 is db2)  # True (один экземпляр)
\`\`\`

## 4. Методы метакласса

**__new__(mcs, name, bases, attrs):**
- Вызывается ПЕРЕД созданием класса
- Должен вернуть новый класс
- Можно модифицировать атрибуты

**__init__(cls, name, bases, attrs):**
- Вызывается ПОСЛЕ создания класса
- Можно выполнить дополнительную инициализацию

**__call__(cls, *args, **kwargs):**
- Вызывается при создании экземпляра класса
- Контролирует создание объектов

## 5. Практическое применение

**Валидация классов:**
\`\`\`python
class ValidatorMeta(type):
    def __new__(mcs, name, bases, attrs):
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
    name = None  # Обязательно
\`\`\`

**Автоматическая регистрация:**
\`\`\`python
plugins = {}

class PluginMeta(type):
    def __new__(mcs, name, bases, attrs):
        cls = super().__new__(mcs, name, bases, attrs)
        if name != 'Plugin':
            plugins[name] = cls
        return cls

class Plugin(metaclass=PluginMeta):
    pass

class MyPlugin(Plugin):
    pass

print(plugins)  # {'MyPlugin': <class MyPlugin>}
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
    
    cheatSheet: `# Простой дескриптор
class Descriptor:
    def __get__(self, obj, objtype=None):
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value
    
    def __set_name__(self, owner, name):
        self.name = name

class Person:
    name = Descriptor()

# Дескриптор с валидацией
class Typed(Descriptor):
    def __init__(self, type_):
        self.type = type_
    
    def __set__(self, obj, value):
        if not isinstance(value, self.type):
            raise TypeError(f"Expected {self.type.__name__}")
        super().__set__(obj, value)

# Использование
class Product:
    name = Typed(str)
    price = Typed(float)

# Property как дескриптор
@property
def name(self):
    return self._name

@name.setter
def name(self, value):
    self._name = value`,

    materials: [
      {
        type: "article",
        title: "Descriptor HowTo Guide",
        url: "https://docs.python.org/3/howto/descriptor.html",
        description: "Официальное руководство"
      },
      {
        type: "link",
        title: "Real Python Descriptors",
        url: "https://realpython.com/python-descriptors/",
        description: "Подробный разбор с примерами"
      }
    ],

    theory: `# Дескрипторы

## 1. Что такое дескриптор?

**Дескриптор** - это объект, который реализует один из методов: \`__get__\`, \`__set__\`, \`__delete__\`.

**Простыми словами:** Дескриптор позволяет перехватить доступ к атрибуту класса.

## 2. Протокол дескриптора

**__get__(self, obj, objtype=None):**
- Вызывается при чтении атрибута
- \`obj\` - экземпляр класса
- \`objtype\` - класс

**__set__(self, obj, value):**
- Вызывается при записи атрибута
- Если не реализован - атрибут только для чтения

**__delete__(self, obj):**
- Вызывается при удалении атрибута

**__set_name__(self, owner, name):**
- Вызывается при создании класса
- Позволяет узнать имя атрибута

## 3. Простой дескриптор

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

## 4. Дескрипторы с валидацией

**Проверка типа:**
\`\`\`python
class Typed(Descriptor):
    def __init__(self, type_):
        self.type = type_
    
    def __set__(self, obj, value):
        if not isinstance(value, self.type):
            raise TypeError(f"Expected {self.type.__name__}")
        super().__set__(obj, value)

class Product:
    name = Typed(str)
    price = Typed(float)
    
    def __init__(self, name, price):
        self.name = name
        self.price = price
\`\`\`

**Проверка диапазона:**
\`\`\`python
class Positive(Descriptor):
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError("Must be positive")
        super().__set__(obj, value)

class Order:
    quantity = Positive()
\`\`\`

## 5. Property как дескриптор

Встроенный \`@property\` - это тоже дескриптор:

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
export function searchTopics(query: string, topicsList: typeof PYTHON_TOPICS) {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  for (const topic of topicsList) {
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
    
    // Поиск в подсказках
    if (topic.cheatSheet.toLowerCase().includes(lowerQuery)) {
      results.push({ ...topic, matchType: 'cheatSheet' });
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

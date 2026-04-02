// Firestore service for Python topics
import { firestore } from "../main";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

export interface Topic {
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
  isDefault?: boolean;
}

const TOPICS_COLLECTION = "pythonTopics";

// Get all topics
export async function getTopics(): Promise<Topic[]> {
  try {
    const topicsRef = collection(firestore, TOPICS_COLLECTION);
    const snapshot = await getDocs(topicsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
  } catch (error) {
    console.error("Error getting topics:", error);
    return [];
  }
}

// Get default topics
export async function getDefaultTopics(): Promise<Topic[]> {
  try {
    const topicsRef = collection(firestore, TOPICS_COLLECTION);
    const q = query(topicsRef, where("isDefault", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
  } catch (error) {
    console.error("Error getting default topics:", error);
    return [];
  }
}

// Get custom topics
export async function getCustomTopics(): Promise<Topic[]> {
  try {
    const topicsRef = collection(firestore, TOPICS_COLLECTION);
    const q = query(topicsRef, where("isDefault", "==", false));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
  } catch (error) {
    console.error("Error getting custom topics:", error);
    return [];
  }
}

// Create new topic
export async function createTopic(topic: Omit<Topic, 'id'>): Promise<string> {
  try {
    const topicsRef = collection(firestore, TOPICS_COLLECTION);
    const newDoc = doc(topicsRef);
    await setDoc(newDoc, {
      ...topic,
      isDefault: topic.isDefault || false,
      createdAt: new Date(),
    });
    return newDoc.id;
  } catch (error) {
    console.error("Error creating topic:", error);
    throw error;
  }
}

// Update existing topic
export async function updateTopic(topicId: string, data: Partial<Topic>): Promise<void> {
  try {
    const topicRef = doc(firestore, TOPICS_COLLECTION, topicId);
    await updateDoc(topicRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    throw error;
  }
}

// Delete topic
export async function deleteTopic(topicId: string): Promise<void> {
  try {
    await deleteDoc(doc(firestore, TOPICS_COLLECTION, topicId));
  } catch (error) {
    console.error("Error deleting topic:", error);
    throw error;
  }
}

// Initialize default topics (run once)
export async function initializeDefaultTopics(): Promise<void> {
  try {
    const existingTopics = await getDefaultTopics();
    if (existingTopics.length >= 8) {
      return; // Already initialized with all topics
    }

    const defaultTopics: Omit<Topic, 'id'>[] = [
      {
        isDefault: true,
        category: "Основы",
        level: 1,
        title: "Типы данных",
        description: "Числа, строки, списки, словари, кортежи, множества",
        cheatSheet: `# Числа (int, float)
age = 25          # int
price = 19.99     # float
result = 10 // 3  # 3 (целочисленное)
mod = 10 % 3      # 1 (остаток)

# Строки (str)
text = "Hello"
text[0]           # 'H'
text[1:4]         # 'ell'
text.upper()      # 'HELLO'
f"Value: {x}"     # f-string

# Списки (list)
lst = [1, 2, 3]
lst.append(4)
lst[0] = 10

# Словари (dict)
dct = {"key": "value"}
dct["key"]
dct.keys()

# Множества (set)
st = {1, 2, 3}
st.add(4)`,
        theory: `# Типы данных в Python

## Введение

Python - язык с **динамической типизацией**. Тип переменной определяется автоматически по значению.

## 1. Числовые типы

### int - целые числа
- Неограниченный размер
- Операции: +, -, *, /, //, %, **

### float - числа с плавающей точкой
- Могут быть неточными
- Используйте decimal для финансов

## 2. Строки (str)

**Неизменяемые** последовательности символов.

**Основные методы:**
- upper()/lower() - регистр
- split() - разбить на список
- replace() - замена
- find() - найти подстроку

## 3. Списки (list)

**Изменяемые** упорядоченные коллекции.

**Операции:**
- append(), insert(), remove()
- pop(), index(), count()
- sort(), reverse()

## 4. Словари (dict)

Коллекции пар ключ-значение.

**Операции:**
- dct[key] - доступ
- dct.get(key, default) - безопасный доступ
- keys(), values(), items()

## 5. Множества (set)

Уникальные элементы.

**Операции:**
- union (|), intersection (&)
- difference (-)`,
        materials: [
          { type: "video", title: "Python за 1 час - Типы данных", url: "https://www.youtube.com/watch?v=Z1Yd7upQsXY", description: "Полный курс" },
          { type: "article", title: "Официальная документация", url: "https://docs.python.org/3/library/stdtypes.html", description: "Встроенные типы" }
        ],
        codeExamples: [
          { title: "Работа со строками", code: `text = "Hello, World!"\nprint(f"Длина: {len(text)}")\nprint(f"Верхний регистр: {text.upper()}")` }
        ],
        tasks: [
          { title: "Создайте переменные", description: "Создайте int, float, str, list", starterCode: "# Создайте переменные", expectedOutput: "age: 25", solution: "age = 25" }
        ]
      },
      {
        isDefault: true,
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

# for цикл
for i in range(5):      # 0,1,2,3,4
    print(i)

for i in range(2, 6):   # 2,3,4,5
    print(i)

# while цикл
while x < 10:
    x += 1

# break / continue
for i in range(10):
    if i == 5:
        break
    if i % 2 == 0:
        continue`,
        theory: `# Управляющие конструкции

## 1. Условные операторы

**Синтаксис:**
\`\`\`python
if условие1:
    # код
elif условие2:
    # код
else:
    # код
\`\`\`

**Логические операторы:**
- and - И (оба истинны)
- or - ИЛИ (одно истинно)
- not - НЕ (инверсия)

## 2. Цикл for

Перебор последовательностей.

**range():**
- range(5) - 0..4
- range(2, 6) - 2..5
- range(0, 10, 2) - 0,2,4,6,8

## 3. Цикл while

Выполняется пока условие истинно.

**Важно:** Убедитесь что условие станет ложным!

## 4. break и continue

- break - выход из цикла
- continue - пропуск итерации`,
        materials: [
          { type: "video", title: "Циклы и условия", url: "https://www.youtube.com/watch?v=6iF8Xb7Z3wQ", description: "Полный разбор" }
        ],
        codeExamples: [
          { title: "Проверка условий", code: `age = 20\nif age < 13:\n    print("Ребенок")\nelif age < 18:\n    print("Подросток")\nelse:\n    print("Взрослый")` }
        ],
        tasks: [
          { title: "Проверка числа", description: "Проверьте на четность", starterCode: "number = 42", expectedOutput: "Четное", solution: "if number % 2 == 0:\n    print('Четное')" }
        ]
      },
      {
        isDefault: true,
        category: "Основы",
        level: 3,
        title: "Функции",
        description: "Объявление, аргументы, return, lambda",
        cheatSheet: `# Объявление
def func(param1, param2):
    return result

# Вызов
result = func(arg1, arg2)

# Параметры по умолчанию
def greet(name="Guest"):
    return f"Hello, {name}!"

# *args, **kwargs
def sum_all(*args):
    return sum(args)

def print_info(**kwargs):
    for k, v in kwargs.items():
        print(f"{k}: {v}")

# Lambda
square = lambda x: x ** 2`,
        theory: `# Функции

## 1. Объявление функций

\`\`\`python
def имя(параметры):
    """Документация"""
    return результат
\`\`\`

**Ключевые моменты:**
- def - ключевое слово
- return возвращает значение
- Без return возвращается None

## 2. Параметры

**По умолчанию:**
\`\`\`python
def greet(name="Guest"):
    return f"Hello, {name}!"
\`\`\`

**Произвольное число:**
- *args - позиционные
- **kwargs - именованные

## 3. Lambda-функции

Анонимные функции в одну строку:
\`\`\`python
square = lambda x: x ** 2
\`\`\`

**Использование:**
- map(func, iterable)
- filter(func, iterable)
- sorted(iterable, key=func)`,
        materials: [
          { type: "article", title: "Functions in Python", url: "https://docs.python.org/3/tutorial/controlflow.html", description: "Официальная документация" }
        ],
        codeExamples: [
          { title: "Функция с параметрами", code: `def introduce(name, age, city="Unknown"):\n    return f"{name}, {age} лет, из {city}"` }
        ],
        tasks: [
          { title: "Функция сложения", description: "Напишите add(a, b)", starterCode: "def add(a, b):", expectedOutput: "5", solution: "def add(a, b):\n    return a + b" }
        ]
      },
      {
        isDefault: true,
        category: "ООП",
        level: 4,
        title: "Классы и объекты",
        description: "Основы ООП, атрибуты, методы, __init__",
        cheatSheet: `# Класс
class ClassName:
    def __init__(self, param):
        self.attr = param
    
    def method(self):
        return self.attr

# Объект
obj = ClassName(value)

# Наследование
class Child(Parent):
    def __init__(self, param):
        super().__init__(param)

# Проверка
isinstance(obj, Class)  # True`,
        theory: `# Объектно-ориентированное программирование

## 1. Классы и объекты

**Класс** - шаблон для объектов.
**Объект** - экземпляр класса.

\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, {self.name}"
\`\`\`

**self** - ссылка на текущий объект.

## 2. Наследование

\`\`\`python
class Child(Parent):
    pass
\`\`\`

**Переопределение:**
\`\`\`python
class Dog(Animal):
    def speak(self):  # Переопределяем
        return "Woof!"
\`\`\`

## 3. Инкапсуляция

- name - публичный
- _name - защищённый
- __name - приватный

## 4. Полиморфизм

Один интерфейс для разных классов.`,
        materials: [
          { type: "video", title: "ООП в Python", url: "https://www.youtube.com/watch?v=Ej_02ICOIgs", description: "Классы и объекты" }
        ],
        codeExamples: [
          { title: "Простой класс", code: `class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nalice = Person("Alice", 25)` }
        ],
        tasks: [
          { title: "Создайте класс Rectangle", description: "Методы area и perimeter", starterCode: "class Rectangle:", expectedOutput: "Area: 50", solution: "class Rectangle:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h" }
        ]
      },
      {
        isDefault: true,
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

# С аргументами
def decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

# functools.wraps
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper`,
        theory: `# Декораторы

## 1. Что такое декоратор?

**Декоратор** - функция, расширяющая поведение другой функции.

**Простыми словами:** Обёртка вокруг функции.

## 2. Синтаксис

\`\`\`python
def my_decorator(func):
    def wrapper():
        print("До")
        func()
        print("После")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")
\`\`\`

## 3. Декораторы с аргументами

\`\`\`python
def decorator(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\`

## 4. functools.wraps

Сохраняет имя и документацию:
\`\`\`python
from functools import wraps

def decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper
\`\`\``,
        materials: [
          { type: "article", title: "Decorators in Python", url: "https://docs.python.org/3/glossary.html#term-decorator", description: "Официальная документация" }
        ],
        codeExamples: [
          { title: "Декоратор времени", code: `import time\ndef timer(func):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = func(*args, **kwargs)\n        print(f"Time: {time.time()-start:.2f}s")\n        return result\n    return wrapper` }
        ],
        tasks: [
          { title: "Декоратор логирования", description: "Выводите имя функции", starterCode: "def logger(func):", expectedOutput: "Calling func", solution: "def logger(func):\n    def wrapper(*args, **kwargs):\n        print(f'Calling {func.__name__}')\n        return func(*args, **kwargs)\n    return wrapper" }
        ]
      },
      {
        isDefault: true,
        category: "Продвинутый",
        level: 6,
        title: "Метаклассы",
        description: "Классы для создания классов, type, __new__",
        cheatSheet: `# type - метакласс
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
    pass`,
        theory: `# Метаклассы

## 1. Что такое метакласс?

**Метакласс** - класс, экземплярами которого являются другие классы.

**Иерархия:**
\`\`\`
Метакласс → Класс → Объект
\`\`\`

## 2. type - встроенный метакласс

\`\`\`python
# Обычный способ
class MyClass:
    x = 5

# Через type
MyClass = type('MyClass', (), {'x': 5})
\`\`\`

## 3. Создание метакласса

\`\`\`python
class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]
\`\`\`

## 4. Методы метакласса

- __new__ - создание класса
- __init__ - инициализация
- __call__ - создание экземпляра`,
        materials: [
          { type: "article", title: "Metaclasses in Python", url: "https://docs.python.org/3/reference/datamodel.html#metaclasses", description: "Официальное руководство" }
        ],
        codeExamples: [
          { title: "Singleton метакласс", code: `class SingletonMeta(type):\n    _instances = {}\n    def __call__(cls, *args, **kwargs):\n        if cls not in cls._instances:\n            cls._instances[cls] = super().__call__(*args, **kwargs)\n        return cls._instances[cls]\n\nclass Config(metaclass=SingletonMeta):\n    pass` }
        ],
        tasks: [
          { title: "Метакласс InstanceCounter", description: "Считает экземпляры", starterCode: "class InstanceCounter(type):", expectedOutput: "Created: 3", solution: "class InstanceCounter(type):\n    def __new__(mcs, name, bases, attrs):\n        attrs['instance_count'] = 0\n        return super().__new__(mcs, name, bases, attrs)\n    def __call__(cls, *args, **kwargs):\n        instance = super().__call__(*args, **kwargs)\n        cls.instance_count += 1\n        return instance" }
        ]
      },
      {
        isDefault: true,
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

# С валидацией
class Typed(Descriptor):
    def __init__(self, type_):
        self.type = type_
    
    def __set__(self, obj, value):
        if not isinstance(value, self.type):
            raise TypeError(f"Expected {self.type.__name__}")
        super().__set__(obj, value)`,
        theory: `# Дескрипторы

## 1. Что такое дескриптор?

Объект с методами __get__, __set__, __delete__.

**Простыми словами:** Перехват доступа к атрибуту.

## 2. Протокол

**__get__(self, obj, objtype):**
- Вызывается при чтении

**__set__(self, obj, value):**
- Вызывается при записи

**__set_name__(self, owner, name):**
- Вызывается при создании класса

## 3. Пример

\`\`\`python
class Descriptor:
    def __get__(self, obj, objtype=None):
        return obj.__dict__.get(self.name)
    
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value
    
    def __set_name__(self, owner, name):
        self.name = name
\`\`\`

## 4. Валидация

\`\`\`python
class Typed(Descriptor):
    def __init__(self, type_):
        self.type = type_
    
    def __set__(self, obj, value):
        if not isinstance(value, self.type):
            raise TypeError(f"Expected {self.type.__name__}")
        super().__set__(obj, value)
\`\`\``,
        materials: [
          { type: "article", title: "Descriptor HowTo Guide", url: "https://docs.python.org/3/howto/descriptor.html", description: "Официальное руководство" }
        ],
        codeExamples: [
          { title: "Типизированный дескриптор", code: `class Typed:\n    def __init__(self, type_):\n        self.type = type_\n    def __set_name__(self, owner, name):\n        self.name = name\n    def __set__(self, obj, value):\n        if not isinstance(value, self.type):\n            raise TypeError(f"{self.name} must be {self.type.__name__}")\n        obj.__dict__[self.name] = value` }
        ],
        tasks: [
          { title: "Дескриптор для строки", description: "Проверка строки", starterCode: "class StringDescriptor:", expectedOutput: "Name: Alice", solution: "class StringDescriptor:\n    def __set_name__(self, owner, name):\n        self.name = name\n    def __set__(self, obj, value):\n        if not isinstance(value, str) or not value.strip():\n            raise ValueError('Must be non-empty string')\n        obj.__dict__[self.name] = value" }
        ]
      },
      {
        isDefault: true,
        category: "Продвинутый",
        level: 8,
        title: "Логирование (logging)",
        description: "logging, уровни, форматирование, handlers",
        cheatSheet: `# Базовое использование
import logging

logging.basicConfig(level=logging.INFO)
logging.info("Info message")
logging.error("Error message")

# Уровни
DEBUG < INFO < WARNING < ERROR < CRITICAL

# Создание логгера
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Handler
handler = logging.FileHandler('app.log')
handler.setFormatter(formatter)
logger.addHandler(handler)`,
        theory: `# Логирование в Python

## 1. Модуль logging

Встроенный модуль для логирования.

**Уровни (по возрастанию):**
- DEBUG - отладочная информация
- INFO - обычная информация
- WARNING - предупреждение
- ERROR - ошибка
- CRITICAL - критическая ошибка

## 2. Базовое использование

\`\`\`python
import logging

logging.basicConfig(level=logging.INFO)
logging.info("Info message")
logging.error("Error message")
\`\`\`

## 3. Создание логгера

\`\`\`python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
\`\`\`

## 4. Formatter

Формат сообщений:
\`\`\`python
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
\`\`\`

**Переменные:**
- %(asctime)s - время
- %(name)s - имя логгера
- %(levelname)s - уровень
- %(message)s - сообщение

## 5. Handler

\`\`\`python
# В файл
handler = logging.FileHandler('app.log')

# В консоль
handler = logging.StreamHandler()

handler.setFormatter(formatter)
logger.addHandler(handler)
\`\`\``,
        materials: [
          { type: "article", title: "Logging HOWTO", url: "https://docs.python.org/3/howto/logging.html", description: "Официальное руководство" },
          { type: "link", title: "Logging Cookbook", url: "https://docs.python.org/3/howto/logging-cookbook.html", description: "Примеры использования" }
        ],
        codeExamples: [
          { title: "Базовое логирование", code: `import logging\n\nlogging.basicConfig(\n    level=logging.INFO,\n    format='%(asctime)s - %(levelname)s - %(message)s'\n)\n\nlogging.debug("Debug message")\nlogging.info("Info message")\nlogging.warning("Warning")\nlogging.error("Error message")` },
          { title: "Продвинутое логирование", code: `import logging\n\nlogger = logging.getLogger(__name__)\nlogger.setLevel(logging.DEBUG)\n\nhandler = logging.FileHandler('app.log')\nformatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')\nhandler.setFormatter(formatter)\nlogger.addHandler(handler)\n\nlogger.info("Application started")` }
        ],
        tasks: [
          { title: "Настройте логирование", description: "Создайте logger с FileHandler", starterCode: "import logging\n\nlogger = logging.getLogger(__name__)", expectedOutput: "INFO in app: Test message", solution: "import logging\n\nlogger = logging.getLogger(__name__)\nlogger.setLevel(logging.INFO)\n\nhandler = logging.StreamHandler()\nformatter = logging.Formatter('%(levelname)s in %(name)s: %(message)s')\nhandler.setFormatter(formatter)\nlogger.addHandler(handler)\n\nlogger.info('Test message')" }
        ]
      }
    ];

    // Add all default topics
    for (const topic of defaultTopics) {
      await createTopic(topic);
    }

    console.log(`Default ${defaultTopics.length} topics initialized`);
  } catch (error) {
    console.error("Error initializing default topics:", error);
  }
}

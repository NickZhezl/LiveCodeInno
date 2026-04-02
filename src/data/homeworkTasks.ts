// Домашние задания с автоматической проверкой по ВЫВОДУ
// Включает задания из всех тем Python
export interface HomeworkTask {
  id: string;
  title: string;
  category: string;
  level: number;
  description: string;
  task: string;
  starterCode: string;
  expectedOutput: string;
  solutionCode: string;
  materials?: {
    type: 'video' | 'article' | 'link';
    title: string;
    url: string;
    description?: string;
  }[];
}

export const HOMEWORK_TASKS: HomeworkTask[] = [
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
    title: "Проверка числа",
    category: "Основы",
    level: 2,
    description: "Проверьте число на четность",
    task: `1. Создайте переменную number = 42
2. Проверьте, является ли число четным
3. Выведите "Четное" или "Нечетное"`,
    starterCode: `number = 42

# Проверьте четность и выведите результат

`,
    expectedOutput: "Четное",
    solutionCode: `number = 42
if number % 2 == 0:
    print("Четное")
else:
    print("Нечетное")`,
  },
  {
    id: "hw-basics-3",
    title: "Функция сложения",
    category: "Основы",
    level: 3,
    description: "Напишите функцию add(a, b)",
    task: `1. Создайте функцию add(a, b)
2. Функция должна возвращать сумму a + b
3. Выведите результат add(2, 3)`,
    starterCode: `def add(a, b):
    # Ваш код
    pass

print(add(2, 3))
`,
    expectedOutput: "5",
    solutionCode: `def add(a, b):
    return a + b

print(add(2, 3))`,
  },
  // === СРЕДНИЙ УРОВЕНЬ ===
  {
    id: "hw-intermediate-1",
    title: "Список квадратов",
    category: "Средний уровень",
    level: 4,
    description: "Используйте list comprehension",
    task: `1. Создайте список numbers = [1, 2, 3, 4, 5]
2. Создайте новый список squares с квадратами чисел
3. Выведите squares`,
    starterCode: `numbers = [1, 2, 3, 4, 5]

# Создайте squares через list comprehension

print(f"Квадраты: {squares}")
`,
    expectedOutput: "Квадраты: [1, 4, 9, 16, 25]",
    solutionCode: `numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Квадраты: {squares}")`,
  },
  {
    id: "hw-intermediate-2",
    title: "Класс Rectangle",
    category: "ООП",
    level: 5,
    description: "Создайте класс с методами area и perimeter",
    task: `1. Создайте класс Rectangle
2. Метод area() возвращает площадь
3. Метод perimeter() возвращает периметр
4. Выведите площадь и периметр для Rectangle(5, 10)`,
    starterCode: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        pass
    
    def perimeter(self):
        pass

rect = Rectangle(5, 10)
print(f"Area: {rect.area()}")
print(f"Perimeter: {rect.perimeter()}")
`,
    expectedOutput: `Area: 50
Perimeter: 30`,
    solutionCode: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

rect = Rectangle(5, 10)
print(f"Area: {rect.area()}")
print(f"Perimeter: {rect.perimeter()}")`,
  },
  // === ПРОДВИНУТЫЙ УРОВЕНЬ ===
  {
    id: "hw-advanced-1",
    title: "Декоратор логирования",
    category: "Продвинутый",
    level: 6,
    description: "Создайте декоратор @logger",
    task: `1. Создайте декоратор logger
2. Он должен выводить "Calling {func.__name__}" перед вызовом
3. Примените к функции say_hello`,
    starterCode: `def logger(func):
    def wrapper(*args, **kwargs):
        # Выведите имя функции
        return func(*args, **kwargs)
    return wrapper

@logger
def say_hello(name):
    print(f"Hello, {name}!")

say_hello("Alice")
`,
    expectedOutput: `Calling say_hello
Hello, Alice!`,
    solutionCode: `def logger(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@logger
def say_hello(name):
    print(f"Hello, {name}!")

say_hello("Alice")`,
  },
  {
    id: "hw-advanced-2",
    title: "Метакласс InstanceCounter",
    category: "Продвинутый",
    level: 7,
    description: "Создайте метакласс для подсчёта экземпляров",
    task: `1. Создайте метакласс InstanceCounter
2. Он должен добавлять атрибут instance_count
3. Увеличивайте count при создании каждого экземпляра`,
    starterCode: `class InstanceCounter(type):
    def __new__(mcs, name, bases, attrs):
        attrs['instance_count'] = 0
        return super().__new__(mcs, name, bases, attrs)
    
    def __call__(cls, *args, **kwargs):
        # Увеличьте instance_count
        return super().__call__(*args, **kwargs)

class MyClass(metaclass=InstanceCounter):
    pass

a = MyClass()
b = MyClass()
c = MyClass()

print(f"Created: {MyClass.instance_count}")
`,
    expectedOutput: "Created: 3",
    solutionCode: `class InstanceCounter(type):
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

print(f"Created: {MyClass.instance_count}")`,
  },
  {
    id: "hw-advanced-3",
    title: "Дескриптор StringDescriptor",
    category: "Продвинутый",
    level: 8,
    description: "Создайте дескриптор для валидации строк",
    task: `1. Создайте дескриптор StringDescriptor
2. Проверяйте, что значение - строка
3. Проверяйте, что строка не пустая`,
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
    solutionCode: `class StringDescriptor:
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
print(f"Name: {p.name}")`,
  },
];

// Домашние задания с pytest-тестами для реальной проверки кода
// Включает задания из всех тем Python
export interface HomeworkTask {
  id: string;
  title: string;
  category: string;
  level: number;
  description: string;
  task: string;
  starterCode: string;
  // New pytest-based testing
  pytestCode?: string;  // Pytest test functions
  // Legacy fields (kept for backward compatibility)
  expectedOutput?: string;
  solutionCode?: string;
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
4. Создайте переменную hobbies типа list с тремя элементами: 'reading', 'gaming', 'coding'
5. Выведите все переменные через print()`,
    starterCode: `# Создайте переменные ниже:


`,
    pytestCode: `
def test_age_variable():
    assert isinstance(age, int), "age должен быть int"
    assert age == 25, f"age должен быть 25, получено {age}"

def test_price_variable():
    assert isinstance(price, float), "price должен быть float"
    assert abs(price - 19.99) < 0.01, f"price должен быть 19.99, получено {price}"

def test_name_variable():
    assert isinstance(name, str), "name должен быть str"
    assert name == "Alice", f"name должен быть 'Alice', получено {name}"

def test_hobbies_variable():
    assert isinstance(hobbies, list), "hobbies должен быть list"
    assert len(hobbies) == 3, f"hobbies должен содержать 3 элемента, получено {len(hobbies)}"
    assert 'reading' in hobbies, "hobbies должен содержать 'reading'"
    assert 'gaming' in hobbies, "hobbies должен содержать 'gaming'"
    assert 'coding' in hobbies, "hobbies должен содержать 'coding'"
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
    pytestCode: `
def test_number_value():
    assert number == 42, f"number должен быть 42, получено {number}"

def test_even_check():
    # Проверяем, что код правильно определяет четность
    assert number % 2 == 0, "42 должно быть четным числом"
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
3. Функция должна работать с любыми числами`,
    starterCode: `def add(a, b):
    # Ваш код здесь
    pass


`,
    pytestCode: `
def test_add_positive_numbers():
    result = add(2, 3)
    assert result == 5, f"add(2, 3) должен вернуть 5, получено {result}"

def test_add_negative_numbers():
    result = add(-1, -1)
    assert result == -2, f"add(-1, -1) должен вернуть -2, получено {result}"

def test_add_mixed_numbers():
    result = add(-5, 10)
    assert result == 5, f"add(-5, 10) должен вернуть 5, получено {result}"

def test_add_zeros():
    result = add(0, 0)
    assert result == 0, f"add(0, 0) должен вернуть 0, получено {result}"

def test_add_floats():
    result = add(1.5, 2.5)
    assert abs(result - 4.0) < 0.01, f"add(1.5, 2.5) должен вернуть 4.0, получено {result}"
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
    task: `1. Создайте функцию get_squares(numbers)
2. Функция должна возвращать список квадратов чисел
3. Используйте list comprehension`,
    starterCode: `def get_squares(numbers):
    # Ваш код здесь
    pass


`,
    pytestCode: `
def test_get_squares_basic():
    result = get_squares([1, 2, 3, 4, 5])
    assert result == [1, 4, 9, 16, 25], f"Получено {result}"

def test_get_squares_empty():
    result = get_squares([])
    assert result == [], f"Получено {result}"

def test_get_squares_negative():
    result = get_squares([-1, -2, -3])
    assert result == [1, 4, 9], f"Получено {result}"

def test_get_squares_mixed():
    result = get_squares([0, -1, 2, -3])
    assert result == [0, 1, 4, 9], f"Получено {result}"

def test_uses_list_comprehension():
    import inspect
    source = inspect.getsource(get_squares)
    assert '[' in source and 'for' in source, "Должно использоваться list comprehension"
`,
    expectedOutput: "Квадраты: [1, 4, 9, 16, 25]",
    solutionCode: `def get_squares(numbers):
    return [x**2 for x in numbers]

print(f"Квадраты: {get_squares([1, 2, 3, 4, 5])}")`,
  },
  {
    id: "hw-intermediate-2",
    title: "Класс Rectangle",
    category: "ООП",
    level: 5,
    description: "Создайте класс с методами area и perimeter",
    task: `1. Создайте класс Rectangle
2. Метод __init__(self, width, height)
3. Метод area() возвращает площадь
4. Метод perimeter() возвращает периметр`,
    starterCode: `class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        # Ваш код здесь
        pass

    def perimeter(self):
        # Ваш код здесь
        pass


`,
    pytestCode: `
def test_rectangle_area():
    rect = Rectangle(5, 10)
    assert rect.area() == 50, f"area() должен вернуть 50, получено {rect.area()}"

def test_rectangle_perimeter():
    rect = Rectangle(5, 10)
    assert rect.perimeter() == 30, f"perimeter() должен вернуть 30, получено {rect.perimeter()}"

def test_rectangle_square():
    square = Rectangle(4, 4)
    assert square.area() == 16, f"Площадь квадрата должна быть 16"
    assert square.perimeter() == 16, f"Периметр квадрата должен быть 16"

def test_rectangle_float():
    rect = Rectangle(2.5, 4.0)
    assert abs(rect.area() - 10.0) < 0.01, f"Площадь должна быть 10.0"
    assert abs(rect.perimeter() - 13.0) < 0.01, f"Периметр должен быть 13.0"
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
        pass
        return func(*args, **kwargs)
    return wrapper

@logger
def say_hello(name):
    print(f"Hello, {name}!")


`,
    pytestCode: `
def test_logger_output():
    import sys
    from io import StringIO
    
    old_stdout = sys.stdout
    sys.stdout = StringIO()
    
    say_hello("Alice")
    
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
    
    assert "Calling say_hello" in output, "Должно выводить 'Calling say_hello'"
    assert "Hello, Alice!" in output, "Должно выводить 'Hello, Alice!'"

def test_logger_preserves_functionality():
    import sys
    from io import StringIO
    
    old_stdout = sys.stdout
    sys.stdout = StringIO()
    
    say_hello("Bob")
    
    output = sys.stdout.getvalue()
    sys.stdout = old_stdout
    
    assert "Hello, Bob!" in output, "Функция должна работать корректно"
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


`,
    pytestCode: `
def test_instance_counter_increments():
    a = MyClass()
    assert MyClass.instance_count == 1, f"instance_count должен быть 1, получено {MyClass.instance_count}"

def test_multiple_instances():
    MyClass.instance_count = 0  # Reset
    a = MyClass()
    b = MyClass()
    c = MyClass()
    assert MyClass.instance_count == 3, f"instance_count должен быть 3, получено {MyClass.instance_count}"

def test_class_has_instance_count():
    assert hasattr(MyClass, 'instance_count'), "MyClass должен иметь атрибут instance_count"
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


`,
    pytestCode: `
def test_valid_string():
    p = Person("Alice")
    assert p.name == "Alice", f"name должен быть 'Alice', получено {p.name}"

def test_invalid_type():
    try:
        p = Person(123)
        assert False, "Должен выбросить TypeError"
    except TypeError:
        pass  # Ожидаемое поведение

def test_empty_string():
    try:
        p = Person("")
        assert False, "Должен выбросить ValueError для пустой строки"
    except ValueError:
        pass  # Ожидаемое поведение

def test_whitespace_only():
    try:
        p = Person("   ")
        assert False, "Должен выбросить ValueError для строки из пробелов"
    except ValueError:
        pass  # Ожидаемое поведение
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

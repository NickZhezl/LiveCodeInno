import { useState, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  useToast,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { FiPlay, FiTrash } from "react-icons/fi";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { executeCode } from "../utils/codeExecutor";

interface PythonSandboxProps {
  onBack: () => void;
}

export default function PythonSandbox({ onBack }: PythonSandboxProps) {
  const [code, setCode] = useState<string>(`# Python Песочница
# Пишите любой код здесь и нажимайте "Выполнить"

# Пример 1: Переменные
name = "Python Developer"
age = 25
skills = ["Python", "JavaScript", "SQL"]

print(f"Привет, {name}!")
print(f"Возраст: {age}")
print(f"Навыки: {skills}")

# Пример 2: Функции
def greet(person):
    return f"Hello, {person}!"

print(greet("World"))

# Пример 3: Списки
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"Квадраты: {squares}")
`);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const toast = useToast();

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setError("");

    try {
      const result = await executeCode("python", code);
      
      if (result.run.stderr) {
        setError(result.run.stderr);
        toast({ title: "Ошибка выполнения", status: "error" });
      } else {
        setOutput(result.run.stdout || "Код выполнен успешно (нет вывода)");
        toast({ title: "Код выполнен!", status: "success" });
      }
    } catch (e: any) {
      setError(e.message || "Неизвестная ошибка");
      toast({ title: "Ошибка", status: "error" });
    } finally {
      setIsRunning(false);
    }
  };

  const clearCode = () => {
    setCode("");
    setOutput("");
    setError("");
    toast({ title: "Редактор очищен", status: "info" });
  };

  const loadExample = (example: string) => {
    const examples: Record<string, string> = {
      basic: `# Основы Python
# Переменные и типы данных

# Числа
age = 25
price = 19.99
count = 100

# Строки
name = "Alice"
message = 'Hello, World!'

# Списки
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]

# Словари
person = {
    "name": "Alice",
    "age": 25,
    "city": "Moscow"
}

# Вывод
print("=== Переменные ===")
print(f"age: {age}")
print(f"price: {price}")
print(f"name: {name}")

print("\\n=== Списки ===")
print(f"Фрукты: {fruits}")
print(f"Первый фрукт: {fruits[0]}")
print(f"Количество: {len(fruits)}")

print("\\n=== Словари ===")
print(f"Имя: {person['name']}")
print(f"Возраст: {person['age']}")
`,
      functions: `# Функции Python

# Простая функция
def greet(name):
    return f"Hello, {name}!"

# Функция с параметром по умолчанию
def greet_person(name="Guest"):
    return f"Welcome, {name}!"

# Функция с несколькими параметрами
def add_numbers(a, b):
    return a + b

# Функция с произвольным числом аргументов
def sum_all(*args):
    return sum(args)

# Вызов функций
print(greet("Alice"))
print(greet_person())
print(greet_person("Bob"))
print(f"2 + 3 = {add_numbers(2, 3)}")
print(f"Сумма 1+2+3+4+5 = {sum_all(1, 2, 3, 4, 5)}")

# Лямбда-функции
square = lambda x: x ** 2
print(f"5^2 = {square(5)}")
`,
      loops: `# Циклы и условия

# Цикл for
print("=== Цикл for ===")
for i in range(5):
    print(f"Итерация {i}")

# Перебор списка
fruits = ["apple", "banana", "cherry"]
print("\\n=== Фрукты ===")
for fruit in fruits:
    print(fruit)

# Цикл while
print("\\n=== Цикл while ===")
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1

# Условные операторы
print("\\n=== Условия ===")
age = 18
if age < 13:
    print("Ребенок")
elif age < 18:
    print("Подросток")
else:
    print("Взрослый")
`,
      oop: `# Классы и ООП

class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def greet(self):
        return f"Hello, I'm {self.name}"
    
    def __str__(self):
        return f"{self.name}, {self.age} лет"

# Создание объектов
alice = Person("Alice", 25)
bob = Person("Bob", 30)

print(alice.greet())
print(bob.greet())

print(f"\\n{alice}")
print(f"{bob}")

# Наследование
class Student(Person):
    def __init__(self, name, age, grade):
        super().__init__(name, age)
        self.grade = grade
    
    def study(self):
        return f"{self.name} изучает Python"

student = Student("Charlie", 20, "A")
print(f"\\n{student.greet()}")
print(student.study())
`,
    };
    
    setCode(examples[example] || "");
    toast({ title: `Пример "${example}" загружен`, status: "info" });
  };

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500">
      {/* Header */}
      <Box p={6} borderBottom="1px solid rgba(255,255,255,0.1)">
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button
              onClick={onBack}
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              size="sm"
            >
              ← Назад
            </Button>
            <Heading fontSize="2xl" color="white">
              Python Песочница
            </Heading>
          </HStack>
        </HStack>
      </Box>

      <HStack align="flex-start" p={6} spacing={6}>
        {/* Editor */}
        <Box flex={1}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text color="white" fontWeight="bold">Редактор кода:</Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("basic")}
                >
                  Основы
                </Button>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("functions")}
                >
                  Функции
                </Button>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("loops")}
                >
                  Циклы
                </Button>
                <Button
                  size="sm"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.2)" }}
                  onClick={() => loadExample("oop")}
                >
                  Классы
                </Button>
              </HStack>
            </HStack>

            <Editor
              height="500px"
              theme="vs-dark"
              language="python"
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={(editor) => { editorRef.current = editor; }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />

            <HStack spacing={4}>
              <Button
                leftIcon={<Icon as={FiPlay} />}
                bg="green.600"
                color="white"
                _hover={{ bg: "green.700" }}
                onClick={runCode}
                isLoading={isRunning}
                loadingText="Выполнение..."
              >
                Выполнить (Ctrl+Enter)
              </Button>
              <Button
                leftIcon={<Icon as={FiTrash} />}
                bg="red.600"
                color="white"
                _hover={{ bg: "red.700" }}
                onClick={clearCode}
              >
                Очистить
              </Button>
            </HStack>
          </VStack>
        </Box>

        {/* Output */}
        <Box flex={1} maxW="600px">
          <VStack spacing={4} align="stretch">
            <Text color="white" fontWeight="bold">Результат:</Text>
            
            <Box
              bg="rgba(0,0,0,0.5)"
              borderRadius="lg"
              border="1px solid rgba(255,255,255,0.1)"
              flex={1}
              minH="500px"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              {/* Output tabs */}
              <HStack bg="rgba(255,255,255,0.05)" px={4} py={2} borderBottom="1px solid rgba(255,255,255,0.1)">
                <Badge colorScheme="green">STDOUT</Badge>
                {error && <Badge colorScheme="red">STDERR</Badge>}
              </HStack>
              
              {/* Output content */}
              <Box flex={1} p={4} overflowY="auto" fontFamily="mono" fontSize="sm">
                {output && (
                  <Box mb={4}>
                    <Text color="green.400" fontWeight="bold" mb={2}># Вывод:</Text>
                    <Box as="pre" color="gray.200" whiteSpace="pre-wrap">
                      {output}
                    </Box>
                  </Box>
                )}
                
                {error && (
                  <Box>
                    <Text color="red.400" fontWeight="bold" mb={2}># Ошибка:</Text>
                    <Box as="pre" color="red.300" whiteSpace="pre-wrap">
                      {error}
                    </Box>
                  </Box>
                )}
                
                {!output && !error && (
                  <Box color="gray.500" textAlign="center" py={20}>
                    <Text>Нажмите "Выполнить" для запуска кода</Text>
                    <Text fontSize="xs" mt={2}>или выберите пример из меню выше</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
}

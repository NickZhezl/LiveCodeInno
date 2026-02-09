import { useState } from "react";
import { Box, Button, Text, useToast, Spinner } from "@chakra-ui/react";
import { executeCode } from "../api";

const Output = ({ editorRef, language }: { editorRef: any; language: string }) => {
  const [output, setOutput] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const toast = useToast();

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    
    try {
      setIsLoading(true);
      // Очищаем старый вывод перед запуском
      setOutput([]); 
      setIsError(false);

      const result = await executeCode(language, sourceCode);
      
      // Разбиваем output на строки
      const outputLines = result.run.output ? result.run.output.split("\n") : [];
      
      // Проверяем, есть ли ошибка (stderr)
      if (result.run.stderr) {
          setIsError(true);
          // Добавляем текст ошибки к выводу
          const errorLines = result.run.stderr.split("\n");
          setOutput([...outputLines, ...errorLines]);
      } else {
          setIsError(false);
          setOutput(outputLines);
      }

    } catch (error: any) {
      setIsError(true);
      setOutput([error.message || "Unknown error occurred"]);
      
      toast({
        title: "Execution failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
      <Text mb={2} fontSize="lg" color="white">Output</Text>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        isLoading={isLoading}
        onClick={runCode}
        _hover={{ bg: "rgba(72, 187, 120, 0.1)" }}
      >
        Run Code
      </Button>
      
      <Box
        height="75vh"
        p={3}
        // Меняем цвет границы: Красный если ошибка, серый если нет
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
        bg="#1e1e1e" // Темный фон явно
        overflowY="auto"
      >
        {isLoading ? (
            <Spinner color="blue.500" />
        ) : output ? (
          output.map((line, i) => (
            <Text 
                key={i} 
                // ВАЖНОЕ ИСПРАВЛЕНИЕ:
                // Если ошибка — текст красный (red.400)
                // Если успех — текст белый (white)
                color={isError ? "red.400" : "white"}
                fontFamily="monospace"
                whiteSpace="pre-wrap" // Сохраняем пробелы и переносы
            >
                {line}
            </Text>
          ))
        ) : (
          <Text color="gray.500">Click "Run Code" to see the output here</Text>
        )}
      </Box>
    </Box>
  );
};

export default Output;
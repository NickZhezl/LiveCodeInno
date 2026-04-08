import { useState, useEffect } from "react";
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
  Card,
  CardBody,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { FiCheck, FiX, FiRefreshCw, FiBook } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../main";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface FlashcardsProps {
  onBack: () => void;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

const FLASHCARD_DECKS: Flashcard[] = [
  {
    id: "fc-1",
    question: "Что такое list comprehension в Python?",
    answer: "Синтаксическая конструкция для создания списков в одну строку: [expression for item in iterable if condition]",
    category: "Основы",
    difficulty: "easy",
  },
  {
    id: "fc-2",
    question: "В чем разница между list и tuple?",
    answer: "List изменяемый (mutable), tuple неизменяемый (immutable). List создается с [], tuple с ()",
    category: "Типы данных",
    difficulty: "easy",
  },
  {
    id: "fc-3",
    question: "Что делает декоратор @staticmethod?",
    answer: "Объявляет метод статическим - он не получает ни self, ни cls. Вызывается на классе, а не на экземпляре",
    category: "ООП",
    difficulty: "medium",
  },
  {
    id: "fc-4",
    question: "Что такое *args и **kwargs?",
    answer: "*args - позиционные аргументы (кортеж), **kwargs - именованные аргументы (словарь). Позволяют передавать переменное число аргументов",
    category: "Функции",
    difficulty: "medium",
  },
  {
    id: "fc-5",
    question: "Как работает сборщик мусора в Python?",
    answer: "Python использует подсчет ссылок + циклический сборщик мусора. Когда счетчик ссылок на объект достигает 0, объект удаляется",
    category: "Продвинутый",
    difficulty: "hard",
  },
  {
    id: "fc-6",
    question: "Что такое GIL (Global Interpreter Lock)?",
    answer: "Мьютекс, защищающий доступ к объектам Python. Позволяет только одному потоку выполнять Python байт-код одновременно",
    category: "Продвинутый",
    difficulty: "hard",
  },
  {
    id: "fc-7",
    question: "Что такое lambda-функция?",
    answer: "Анонимная функция: lambda arguments: expression. Пример: square = lambda x: x ** 2",
    category: "Функции",
    difficulty: "easy",
  },
  {
    id: "fc-8",
    question: "В чем разница между == и is?",
    answer: "== сравнивает значения, is сравнивает идентичность объектов (адреса в памяти)",
    category: "Основы",
    difficulty: "easy",
  },
  {
    id: "fc-9",
    question: "Что такое генератор в Python?",
    answer: "Функция с yield, которая возвращает итератор. Генерирует значения по одному, экономя память",
    category: "Продвинутый",
    difficulty: "medium",
  },
  {
    id: "fc-10",
    question: "Что такое контекстный менеджер?",
    answer: "Объект с методами __enter__ и __exit__. Используется с with для автоматического управления ресурсами",
    category: "Продвинутый",
    difficulty: "medium",
  },
  {
    id: "fc-11",
    question: "Как работает map()?",
    answer: "Применяет функцию к каждому элементу итерируемого объекта: map(function, iterable). Возвращает итератор",
    category: "Функции",
    difficulty: "easy",
  },
  {
    id: "fc-12",
    question: "Что такое метакласс?",
    answer: "Класс класса. Определяет как создаются классы. type - базовый метакласс Python",
    category: "Продвинутый",
    difficulty: "hard",
  },
];

export default function Flashcards({ onBack }: FlashcardsProps) {
  const { userData } = useAuth();
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
  const [filteredDeck, setFilteredDeck] = useState<Flashcard[]>(FLASHCARD_DECKS);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    filterDeck();
  }, [selectedCategory]);

  const loadProgress = async () => {
    if (!userData) return;

    try {
      const progressRef = doc(firestore, "users", userData.uid, "progress", "flashcards");
      const progressSnap = await getDoc(progressRef);

      if (progressSnap.exists()) {
        const data = progressSnap.data();
        setKnownCards(new Set(data.known || []));
        setUnknownCards(new Set(data.unknown || []));
      }
    } catch (error) {
      console.error("Error loading flashcard progress:", error);
    }
  };

  const saveProgress = async () => {
    if (!userData) return;

    try {
      const progressRef = doc(firestore, "users", userData.uid, "progress", "flashcards");
      await setDoc(progressRef, {
        known: Array.from(knownCards),
        unknown: Array.from(unknownCards),
        lastStudied: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const filterDeck = () => {
    if (selectedCategory === "all") {
      setFilteredDeck(FLASHCARD_DECKS);
    } else {
      setFilteredDeck(FLASHCARD_DECKS.filter((c) => c.category === selectedCategory));
    }
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const markAsKnown = () => {
    const card = filteredDeck[currentIndex];
    if (card) {
      setKnownCards(new Set([...knownCards, card.id]));
      setUnknownCards(new Set([...unknownCards].filter((id) => id !== card.id)));
      saveProgress();
      nextCard();
      toast({ title: "✅ Запомнил!", status: "success" });
    }
  };

  const markAsUnknown = () => {
    const card = filteredDeck[currentIndex];
    if (card) {
      setUnknownCards(new Set([...unknownCards, card.id]));
      setKnownCards(new Set([...knownCards].filter((id) => id !== card.id)));
      saveProgress();
      nextCard();
      toast({ title: "📚 Повторим позже", status: "info" });
    }
  };

  const nextCard = () => {
    if (currentIndex < filteredDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      toast({ title: "🎉 Колода пройдена!", status: "success" });
      setCurrentIndex(0);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const resetProgress = () => {
    setKnownCards(new Set());
    setUnknownCards(new Set());
    saveProgress();
    toast({ title: "Прогресс сброшен", status: "info" });
  };

  const categories = ["all", ...Array.from(new Set(FLASHCARD_DECKS.map((c) => c.category)))];
  const currentCard = filteredDeck[currentIndex];
  const progress = filteredDeck.length > 0 ? ((currentIndex + 1) / filteredDeck.length) * 100 : 0;

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
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
            🃏 Флеш-карточки
          </Heading>
        </HStack>
        <Button
          size="sm"
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.2)" }}
          leftIcon={<Icon as={FiRefreshCw} />}
          onClick={resetProgress}
        >
          Сбросить
        </Button>
      </HStack>

      {/* Stats */}
      <SimpleGrid columns={3} spacing={4} mb={6}>
        <Card bg="rgba(255,255,255,0.05)" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Всего карточек</StatLabel>
              <StatNumber color="white">{filteredDeck.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="rgba(0,255,0,0.05)" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Запомнил</StatLabel>
              <StatNumber color="green.400">{knownCards.size}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg="rgba(255,0,0,0.05)" borderRadius="xl">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Повторить</StatLabel>
              <StatNumber color="red.400">{unknownCards.size}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Category Filter */}
      <HStack spacing={2} mb={6} flexWrap="wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            bg={selectedCategory === cat ? "purple.600" : "rgba(255,255,255,0.1)"}
            color="white"
            _hover={{ bg: selectedCategory === cat ? "purple.700" : "rgba(255,255,255,0.2)" }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "all" ? "Все" : cat}
          </Button>
        ))}
      </HStack>

      {/* Progress Bar */}
      <Progress value={progress} size="sm" colorScheme="purple" borderRadius="full" mb={6} />

      {/* Flashcard */}
      {currentCard ? (
        <VStack spacing={6}>
          <Card
            bg="rgba(255,255,255,0.05)"
            borderRadius="xl"
            w="full"
            minH="300px"
            cursor="pointer"
            onClick={() => setShowAnswer(!showAnswer)}
            _hover={{ bg: "rgba(255,255,255,0.08)" }}
          >
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Badge colorScheme="blue">{currentCard.category}</Badge>
                  <Badge colorScheme={currentCard.difficulty === "easy" ? "green" : currentCard.difficulty === "medium" ? "yellow" : "red"}>
                    {currentCard.difficulty === "easy" ? "Легкий" : currentCard.difficulty === "medium" ? "Средний" : "Сложный"}
                  </Badge>
                </HStack>

                <VStack spacing={4}>
                  <Text color="white" fontSize="xl" fontWeight="bold" textAlign="center">
                    {currentCard.question}
                  </Text>

                  {showAnswer && (
                    <Box
                      bg="rgba(128,0,255,0.1)"
                      p={4}
                      borderRadius="md"
                      w="full"
                    >
                      <Text color="gray.200" fontSize="lg" textAlign="center">
                        {currentCard.answer}
                      </Text>
                    </Box>
                  )}
                </VStack>

                <Text color="gray.500" fontSize="sm" textAlign="center">
                  {showAnswer ? "Нажмите, чтобы скрыть ответ" : "Нажмите, чтобы показать ответ"}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Controls */}
          <HStack spacing={4}>
            <Button
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              onClick={prevCard}
              isDisabled={currentIndex === 0}
            >
              ← Назад
            </Button>

            <Button
              bg="red.600"
              color="white"
              _hover={{ bg: "red.700" }}
              leftIcon={<Icon as={FiX} />}
              onClick={markAsUnknown}
            >
              Не знаю
            </Button>

            <Button
              bg="green.600"
              color="white"
              _hover={{ bg: "green.700" }}
              leftIcon={<Icon as={FiCheck} />}
              onClick={markAsKnown}
            >
              Знаю
            </Button>

            <Button
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{ bg: "rgba(255,255,255,0.2)" }}
              onClick={nextCard}
              isDisabled={currentIndex === filteredDeck.length - 1}
            >
              Вперед →
            </Button>
          </HStack>

          <Text color="gray.400">
            Карточка {currentIndex + 1} из {filteredDeck.length}
          </Text>
        </VStack>
      ) : (
        <Box bg="rgba(255,255,255,0.05)" borderRadius="xl" p={10} textAlign="center">
          <Icon as={FiBook} w={16} h={16} color="gray.600" mb={4} />
          <Text color="gray.400" fontSize="lg">Нет карточек в этой категории</Text>
        </Box>
      )}
    </Box>
  );
}

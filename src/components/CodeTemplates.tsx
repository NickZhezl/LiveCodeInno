import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from "@chakra-ui/react";
import { FiArrowLeft, FiCode, FiSearch, FiCopy } from "react-icons/fi";
import { CODE_TEMPLATES, CodeTemplate, getCategories, searchTemplates } from "../data/codeTemplates";

interface CodeTemplatesProps {
  onBack: () => void;
  onLoadTemplate?: (code: string) => void;
}

export default function CodeTemplates({ onBack, onLoadTemplate }: CodeTemplatesProps) {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState(CODE_TEMPLATES);

  const categories = ["all", ...getCategories()];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setFilteredTemplates(searchTemplates(query));
    } else {
      setFilteredTemplates(CODE_TEMPLATES);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Код скопирован в буфер обмена",
      status: "success",
      duration: 2000,
    });
  };

  const handleLoadTemplate = (template: CodeTemplate) => {
    if (onLoadTemplate) {
      onLoadTemplate(template.code);
      onBack();
    }
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
              leftIcon={<Icon as={FiArrowLeft} />}
            >
              Назад
            </Button>
            <Heading fontSize="2xl" color="white">
              📚 Шаблоны кода
            </Heading>
          </HStack>
          <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="full">
            {CODE_TEMPLATES.length} шаблонов
          </Badge>
        </HStack>
      </Box>

      {/* Search Bar */}
      <Box p={6} pb={0}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Поиск шаблонов..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            bg="rgba(255,255,255,0.05)"
            border="1px solid rgba(255,255,255,0.1)"
            color="white"
            _placeholder={{ color: "gray.500" }}
            focusBorderColor="purple.500"
          />
        </InputGroup>
      </Box>

      <Box p={6}>
        {/* Categories Tabs */}
        <Tabs variant="soft-rounded" colorScheme="purple" size="md">
          <TabList justifyContent="center" mb={6} flexWrap="wrap">
            {categories.map((cat) => (
              <Tab
                key={cat}
                _selected={{ bg: "purple.600", color: "white" }}
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="bold"
                m={1}
                textTransform="capitalize"
              >
                {cat === "all" ? "Все" : cat}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {categories.map((cat) => (
              <TabPanel key={cat} px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {(cat === "all" ? filteredTemplates : filteredTemplates.filter(t => t.category === cat))
                    .map((template) => (
                      <Card
                        key={template.id}
                        bg="rgba(255,255,255,0.05)"
                        borderRadius="xl"
                        p={4}
                        border="1px solid rgba(255,255,255,0.1)"
                        _hover={{
                          bg: "rgba(255,255,255,0.1)",
                          transform: "translateY(-4px)",
                          transition: "all 0.2s",
                        }}
                      >
                        <CardBody p={0}>
                          <VStack align="start" spacing={3}>
                            <HStack justify="space-between" w="100%">
                              <Text color="white" fontWeight="bold" fontSize="lg">
                                {template.title}
                              </Text>
                              <Badge colorScheme="purple" fontSize="xs">
                                {template.language}
                              </Badge>
                            </HStack>
                            
                            <Text color="gray.400" fontSize="sm">
                              {template.description}
                            </Text>

                            <HStack spacing={1} flexWrap="wrap">
                              {template.tags.map((tag, idx) => (
                                <Badge key={idx} colorScheme="gray" fontSize="xs" px={2} py={0.5} borderRadius="full">
                                  {tag}
                                </Badge>
                              ))}
                            </HStack>

                            <HStack spacing={2} w="100%">
                              <Button
                                size="sm"
                                bg="purple.600"
                                color="white"
                                _hover={{ bg: "purple.700" }}
                                leftIcon={<Icon as={FiCode} />}
                                onClick={() => handleLoadTemplate(template)}
                                flex={1}
                              >
                                Использовать
                              </Button>
                              <Button
                                size="sm"
                                bg="rgba(255,255,255,0.1)"
                                color="white"
                                _hover={{ bg: "rgba(255,255,255,0.2)" }}
                                leftIcon={<Icon as={FiCopy} />}
                                onClick={() => handleCopyCode(template.code)}
                              >
                                Копировать
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </SimpleGrid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}

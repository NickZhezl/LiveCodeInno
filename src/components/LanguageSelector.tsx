import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";
import styles from "../styles/display.module.css";

// Типизация пропсов
interface LanguageSelectorProps {
  language: string;
  onSelect: (language: string) => void;
}

// Превращаем объект версий в массив [ключ, значение]
const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "blue.400";

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onSelect,
}) => {
  return (
    <Box ml={2} mb={4}>
      <div className={styles.display}>
        <Text mb={2} fontSize="lg">
          Language:
        </Text>
        <Menu isLazy>
          <MenuButton as={Button}>
            {/* Показываем выбранный язык капсом */}
            {language.toUpperCase()}
          </MenuButton>
          
          <MenuList bg="#110c1b">
            {languages.map(([lang, version]) => (
              <MenuItem
                key={lang}
                color={lang === language ? ACTIVE_COLOR : "gray.400"} // Цвет неактивных серый
                bg={lang === language ? "gray.900" : "transparent"}
                _hover={{
                  color: ACTIVE_COLOR,
                  bg: "gray.900",
                }}
                onClick={() => onSelect(lang)}
              >
                {/* Название языка капсом */}
                {lang.toUpperCase()}
                &nbsp;
                <Text as="span" color="gray.600" fontSize="sm">
                  {/* Приводим версию к строке, чтобы TS не ругался */}
                  ({version as string})
                </Text>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </div>
    </Box>
  );
};

export default LanguageSelector;
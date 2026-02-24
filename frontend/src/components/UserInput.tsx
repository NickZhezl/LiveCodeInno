import { useState, useEffect } from "react";
// Добавили Text в импорты для заголовка
import { Input, Button, Select, Text, Box } from "@chakra-ui/react"; 
import styles from "../styles/buttons.module.css";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../main";
import { LANGUAGE_VERSIONS } from "../constants";

const UserInput = ({ setUserID, setRoomID }: any) => {
  const [inputValue, setInputValue] = useState("");
  const [roomID, setInputRoomID] = useState<string>("");
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get("roomId");
    if (urlRoomId) {
       setInputRoomID(urlRoomId.toString());
       // Если комната из URL, можно сразу заполнить и roomID для генерации ссылки
       // но setRoomID пока не вызываем, ждем нажатия Start
    }
  }, []);

  const generateSimpleId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const length = 4;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleGenerateRoomID = () => {
    const newRoomID = generateSimpleId();
    setInputRoomID(newRoomID);
  };

  const handleSubmit = async () => {
    if (!roomID) return;

    try {
      const roomRef = doc(firestore, "rooms", roomID);
      await setDoc(roomRef, { language: language }, { merge: true });
    } catch (error) {
      console.error("Error saving language preference:", error);
    }

    setUserID(inputValue);
    setRoomID(roomID);
  };

  return (
    <div className={styles.groups}>
      <div className={styles.groupInputs}>
        <h2 style={{ color: "white", fontSize: 24, marginBottom: 24 }}>Live Code Interviewer</h2>
        
        <Input
          className={styles.defaultInputs}
          type="text"
          width="auto"
          placeholder="Name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          // Принудительно задаем стили, чтобы перекрыть возможные конфликты
          sx={{ bg: "#1a1a2e", border: "1px solid #333", color: "white", _placeholder: { color: "gray.500" } }}
        />
        
        <Input
          type="text"
          className={styles.defaultInputs}
          width="auto"
          placeholder="Unique Room ID"
          value={roomID}
          onChange={(e) => setInputRoomID(e.target.value)}
          sx={{ bg: "#1a1a2e", border: "1px solid #333", color: "white", _placeholder: { color: "gray.500" } }}
        />

        {/* Блок выбора языка */}
        <Box width="100%" mt={2}>
          <Text mb="8px" color="gray.400" fontSize="sm" textAlign="left">
             Choose interview language:
          </Text>
          <Select 
            className={styles.defaultInputs}
            width="auto"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            // --- СТИЛИЗАЦИЯ ПОД ТЕМНУЮ ТЕМУ ---
            bg="#1a1a2e"       // Темный фон (как у инпутов)
            color="white"      // Белый текст
            borderColor="#333" // Темная рамка
            cursor="pointer"
            sx={{
              // Стили для самого выпадающего списка опций (внутри браузера)
              option: {
                background: "#1a1a2e",
                color: "white",
              },
              // Убираем синюю обводку при фокусе
              _focus: { borderColor: "#6c5ce7", boxShadow: "0 0 0 1px #6c5ce7" } 
            }}
          >
            {Object.entries(LANGUAGE_VERSIONS).map(([lang, version]) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()} ({version as string})
              </option>
            ))}
          </Select>
        </Box>

      </div>
      
      <div className={styles.groupButtons}>
        <Button colorScheme="gray" className={styles.defaultButtons} onClick={handleSubmit}>
          Start
        </Button>
        <Button colorScheme="gray" className={styles.defaultButtons} onClick={handleGenerateRoomID}>
          Generate Room ID
        </Button>
        <Button
          className={styles.defaultButtons}
          onClick={() => {
            window.location.href = `/interviewReport/index.html?roomId=${roomID}`;
          }}>
          Interview Reports
        </Button>
      </div>
    </div>
  );
};

export default UserInput;
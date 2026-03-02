import { useState, useEffect } from "react";
// Добавили Text в импорты для заголовка
import { Input, Button, Select, Text, Box } from "@chakra-ui/react";
import styles from "../styles/buttons.module.css";
import { createRoom, getRoom } from "../api/client";

const UserInput = ({ setUserID, setRoomID }: any) => {
  const [inputValue, setInputValue] = useState("");
  const [roomID, setInputRoomID] = useState<string>("");
  const [language, setLanguage] = useState("python");
  const [existingRoomLanguage, setExistingRoomLanguage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get("roomId");
    if (urlRoomId) {
       setInputRoomID(urlRoomId.toString());
       // Load existing room language
       getRoom(urlRoomId).then((data) => {
         if (data?.language) {
           setExistingRoomLanguage(data.language);
           setLanguage(data.language);
         }
       }).catch(() => {
         // Room doesn't exist yet, will be created on start
       });
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
      if (existingRoomLanguage) {
        // Room exists, just use it
        await getRoom(roomID);
      } else {
        // Create new room
        await createRoom(roomID, language);
      }
    } catch (error) {
      console.error("Error with room:", error);
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
             {existingRoomLanguage ? "Room Language (locked):" : "Choose interview language:"}
          </Text>
          {existingRoomLanguage ? (
            // Static display for existing room language
            <Box
              bg="#1a1a2e"
              color="white"
              border="1px solid #333"
              borderRadius="4px"
              px={4}
              py={2}
              fontWeight="bold"
            >
              {existingRoomLanguage.toUpperCase()}
            </Box>
          ) : (
            // Select for new room creation - only Python and SQL
            <Select
              className={styles.defaultInputs}
              width="auto"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              bg="#1a1a2e"
              color="white"
              borderColor="#333"
              cursor="pointer"
              sx={{
                option: {
                  background: "#1a1a2e",
                  color: "white",
                },
                _focus: { borderColor: "#6c5ce7", boxShadow: "0 0 0 1px #6c5ce7" }
              }}
            >
              <option value="python">PYTHON</option>
              <option value="postgresql">SQL (PostgreSQL)</option>
            </Select>
          )}
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
import { useState, useEffect } from "react";
import { Box, Button, useToast } from "@chakra-ui/react";
import UserInput from "./components/UserInput";
import CodeEditor from "./components/CodeEditor";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "./main";

function App() {
  const [userID, setUserID] = useState<string | null>(null);
  const [roomID, setRoomID] = useState<string | null>(null);
  const [roomLanguage, setRoomLanguage] = useState<string | null>(null);
  const toast = useToast();

  // Load room language when room is joined
  useEffect(() => {
    if (roomID) {
      getDoc(doc(firestore, "rooms", roomID)).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.language) {
            setRoomLanguage(data.language);
          }
        }
      }).catch(console.error);
    }
  }, [roomID]);

  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={0}>
      {!userID && <UserInput setUserID={setUserID} setRoomID={setRoomID} />}

      {userID && roomID && (
        <Box>
          <CodeEditor roomId={roomID} userName={userID} roomLanguage={roomLanguage || undefined} />
        </Box>
      )}

      {roomID && userID && (
        <Box style={{ marginTop: 20 }} position="relative" borderRadius="full" p={4}>
          <Button
            sx={{
              color: "#ffffff",
              bg: "rgba(255,255,255, 0.1)",
              _hover: { bg: "rgba(255,255,255, 0.2)" },
            }}
            onClick={() => {
              const roomURL = `${window.location.origin}/?roomId=${roomID}`;
              navigator.clipboard.writeText(roomURL);
              toast({ status: "success", title: "Link copied!" });
            }}
          >
            Copy Room Link
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default App;
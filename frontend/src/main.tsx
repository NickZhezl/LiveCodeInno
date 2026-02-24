import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

// 1. Импорты Firebase
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// 2. Ваша НОВАЯ конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyAdPx1Uxxx0F2Cb-5m5DanVhYrQAwq8cV0",
  authDomain: "live-code-project.firebaseapp.com",
  projectId: "live-code-project",
  storageBucket: "live-code-project.firebasestorage.app",
  messagingSenderId: "258603719856",
  appId: "1:258603719856:web:156f5cd3abd4ca1323af75",
  measurementId: "G-TPRJR3Y7LT"
};

// 3. Инициализация
const app = initializeApp(firebaseConfig);

// Экспортируем firestore, чтобы его видели другие файлы
export const firestore = getFirestore(app); 
// export const analytics = getAnalytics(app);

console.log("Firebase initialized for: Live Code project");

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log("before render");
  root.render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </React.StrictMode>
  );
  console.log("after render call");
} else {
  console.error("Root element not found");
}
import { useState } from "react";
import { Box, VStack, Text, Heading } from "@chakra-ui/react";
import Login from "../components/Login";
import Register from "../components/Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box minH="100vh" bg="#0f0a19" position="relative">
      {/* Background gradient */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="400px"
        bgGradient="linear(to-b, #4a1c7c, #0f0a19)"
        opacity={0.3}
      />
      
      <VStack spacing={8} pt={20}>
        <VStack spacing={2}>
          <Heading fontSize="4xl" color="white">
            Live Code Interviewer
          </Heading>
          <Text color="gray.400" fontSize="lg">
            {isLogin ? "Sign in to continue" : "Create your account"}
          </Text>
        </VStack>

        {isLogin ? (
          <Login
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </VStack>
    </Box>
  );
}

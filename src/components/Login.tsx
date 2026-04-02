import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  useToast,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../contexts/AuthContext";

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        status: "error",
        title: "Email and password are required",
      });
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      toast({
        status: "success",
        title: "Login successful!",
      });
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      toast({
        status: "error",
        title: errorMessage.includes("invalid-credential")
          ? "Invalid email or password"
          : errorMessage.includes("user-not-found")
          ? "No user found with this email"
          : errorMessage.includes("too-many-requests")
          ? "Too many attempts. Please try again later."
          : "Login failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="400px"
      w="full"
      mx="auto"
      mt={16}
      p={8}
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.05)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.1)"
    >
      <VStack as="form" onSubmit={handleLogin} spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Welcome Back
        </Text>

        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          _placeholder={{ color: "gray.500" }}
          color="white"
          focusBorderColor="purple.500"
        />

        <InputGroup>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            _placeholder={{ color: "gray.500" }}
            color="white"
            focusBorderColor="purple.500"
          />
          <InputRightElement>
            <IconButton
              aria-label={showPassword ? "Hide password" : "Show password"}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              color="gray.400"
              _hover={{ color: "white" }}
            />
          </InputRightElement>
        </InputGroup>

        <Button
          type="submit"
          w="full"
          bg="purple.600"
          color="white"
          _hover={{ bg: "purple.700" }}
          isLoading={loading}
        >
          Login
        </Button>

        <Text color="gray.400" fontSize="sm">
          Don't have an account?{" "}
          <Link color="purple.400" onClick={onSwitchToRegister} _hover={{ color: "purple.300" }}>
            Register
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}

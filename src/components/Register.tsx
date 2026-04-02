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

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !displayName) {
      toast({
        status: "error",
        title: "All fields are required",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        status: "error",
        title: "Passwords do not match",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        status: "error",
        title: "Password must be at least 6 characters",
      });
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, displayName);
      toast({
        status: "success",
        title: "Registration successful!",
      });
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      toast({
        status: "error",
        title: errorMessage.includes("email-already-in-use")
          ? "Email already in use"
          : errorMessage.includes("invalid-email")
          ? "Invalid email address"
          : errorMessage.includes("weak-password")
          ? "Password is too weak"
          : "Registration failed. Please try again.",
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
      <VStack as="form" onSubmit={handleRegister} spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Create Account
        </Text>

        <Input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          bg="rgba(255, 255, 255, 0.05)"
          border="1px solid rgba(255, 255, 255, 0.1)"
          _placeholder={{ color: "gray.500" }}
          color="white"
          focusBorderColor="purple.500"
        />

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

        <InputGroup>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            bg="rgba(255, 255, 255, 0.05)"
            border="1px solid rgba(255, 255, 255, 0.1)"
            _placeholder={{ color: "gray.500" }}
            color="white"
            focusBorderColor="purple.500"
          />
          <InputRightElement>
            <IconButton
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
          Register
        </Button>

        <Text color="gray.400" fontSize="sm">
          Already have an account?{" "}
          <Link color="purple.400" onClick={onSwitchToLogin} _hover={{ color: "purple.300" }}>
            Login
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./components/Dashboard";
import Topics from "./components/Topics";
import Homework from "./components/Homework";
import Problems from "./components/Problems";
import MyHomework from "./components/MyHomework";
import PythonSandbox from "./components/PythonSandbox";
import CodeEditor from "./components/CodeEditor";
import InterviewReportComponent from "./interviewReport/InterviewReportComponent";

type Section = "dashboard" | "live-coding" | "topics" | "homework" | "problems" | "my-homework" | "sandbox";

function InterviewReportPage() {
  const { roomId } = useParams<{ roomId: string }>();
  return <InterviewReportComponent initialRoomId={roomId} />;
}

function MainApp() {
  const { userData } = useAuth();
  const [currentSection, setCurrentSection] = useState<Section>("dashboard");
  const [roomId, setRoomId] = useState<string | null>(null);

  // Dashboard
  if (currentSection === "dashboard") {
    return (
      <Dashboard
        onNavigate={(section) => setCurrentSection(section as Section)}
        onStartInterview={(newRoomId) => {
          setRoomId(newRoomId);
          setCurrentSection("live-coding");
        }}
      />
    );
  }

  // Topics
  if (currentSection === "topics") {
    return <Topics onBack={() => setCurrentSection("dashboard")} />;
  }

  // Homework
  if (currentSection === "homework") {
    return <Homework onBack={() => setCurrentSection("dashboard")} />;
  }

  // Problems
  if (currentSection === "problems") {
    return <Problems onBack={() => setCurrentSection("dashboard")} />;
  }

  // My Homework (assigned by admin)
  if (currentSection === "my-homework") {
    return <MyHomework onBack={() => setCurrentSection("dashboard")} />;
  }

  // Python Sandbox
  if (currentSection === "sandbox") {
    return <PythonSandbox onBack={() => setCurrentSection("dashboard")} />;
  }

  // Live Coding (Code Editor)
  if (currentSection === "live-coding" && roomId) {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={0}>
        <Box borderBottom="1px solid rgba(255,255,255,0.1)" pb={4} mb={4}>
          <Box color="white" fontWeight="bold" fontSize="lg">
            {userData?.displayName || "User"}
          </Box>
          <Box fontSize="sm" color="gray.500">
            {userData?.email}
          </Box>
        </Box>
        <CodeEditor roomId={roomId} userName={userData?.displayName || "Anonymous"} />
      </Box>
    );
  }

  return null;
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box minH="100vh" bg="#0f0a19" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="purple.500" />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth/Login Route */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage />
            )
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Interview Report Route */}
        <Route
          path="/report/:roomId"
          element={
            <ProtectedRoute>
              <InterviewReportPage />
            </ProtectedRoute>
          }
        />

        {/* Main App Route */}
        <Route
          path="/"
          element={
            currentUser ? (
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all */}
        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

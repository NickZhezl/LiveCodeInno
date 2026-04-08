import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import { useAuth } from "./contexts/AuthContext";
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
import LiveCoding from "./components/LiveCoding";
import UserProfile from "./components/UserProfile";
import InterviewReportComponent from "./interviewReport/InterviewReportComponent";
import Friends from "./components/Friends";
import Leaderboard from "./components/Leaderboard";
import ChatInbox from "./components/ChatInbox";
import SnippetLibrary from "./components/SnippetLibrary";
import NotificationBell from "./components/NotificationBell";
import DailyChallenge from "./components/DailyChallenge";
import StreakCalendar from "./components/StreakCalendar";
import Flashcards from "./components/Flashcards";
import CodeGolf from "./components/CodeGolf";
import PostgresProblems from "./components/PostgresProblems";
import GenericTopics from "./components/GenericTopics";
import Achievements from "./components/Achievements";
import Stats from "./components/Stats";
import CodeTemplates from "./components/CodeTemplates";
import { POSTGRES_PROBLEMS } from "./data/postgresProblems";
import { PANDAS_NUMPY_TOPICS } from "./data/pandasNumpyTopics";
import { AIRFLOW_TOPICS } from "./data/airflowTopics";
import { SPARK_TOPICS } from "./data/sparkTopics";
import { FiCpu, FiServer, FiZap } from "react-icons/fi";

type Section = "dashboard" | "live-coding" | "topics" | "homework" | "problems" | "my-homework" | "sandbox" | "profile" | "friends" | "leaderboard" | "daily-challenge" | "snippets" | "streak" | "flashcards" | "code-golf" | "postgres" | "pandas" | "airflow" | "spark" | "chat" | "notifications" | "achievements" | "stats" | "templates";

function InterviewReportPage() {
  const { roomId } = useParams<{ roomId: string }>();
  return <InterviewReportComponent initialRoomId={roomId} />;
}

function MainApp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<Section>("dashboard");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  // Check URL for roomId on mount
  useEffect(() => {
    const urlRoomId = searchParams.get("roomId");
    if (urlRoomId && !roomId) {
      setRoomId(urlRoomId);
      setCurrentSection("live-coding");
    }
  }, []); // Only on mount

  // Update URL when room changes
  useEffect(() => {
    if (roomId && currentSection === "live-coding") {
      const currentRoomId = searchParams.get("roomId");
      if (currentRoomId !== roomId) {
        navigate(`/?roomId=${roomId}`, { replace: true });
      }
    }
  }, [roomId, currentSection]); // Don't include navigate in deps

  // Dashboard
  if (currentSection === "dashboard") {
    return (
      <Dashboard
        onNavigate={(section) => setCurrentSection(section as Section)}
        onStartInterview={(newRoomId) => {
          setRoomId(newRoomId);
          setCurrentSection("live-coding");
        }}
        onViewUserProfile={(userId) => {
          setViewingUserId(userId);
          setCurrentSection("profile");
        }}
        onNavigateToHomework={() => setCurrentSection("homework")}
        onNavigateToPostgres={() => setCurrentSection("postgres")}
        onNavigateToPandas={() => setCurrentSection("pandas")}
        onNavigateToAirflow={() => setCurrentSection("airflow")}
        onNavigateToSpark={() => setCurrentSection("spark")}
        onNavigateToAchievements={() => setCurrentSection("achievements")}
        onNavigateToStats={() => setCurrentSection("stats")}
        onNavigateToTemplates={() => setCurrentSection("templates")}
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

  // Daily Challenge
  if (currentSection === "daily-challenge") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <DailyChallenge onBack={() => setCurrentSection("dashboard")} />
      </Box>
    );
  }

  // Streak Calendar
  if (currentSection === "streak") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <StreakCalendar onBack={() => setCurrentSection("dashboard")} />
      </Box>
    );
  }

  // Flashcards
  if (currentSection === "flashcards") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <Flashcards onBack={() => setCurrentSection("dashboard")} />
      </Box>
    );
  }

  // Code Golf
  if (currentSection === "code-golf") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <CodeGolf onBack={() => setCurrentSection("dashboard")} />
      </Box>
    );
  }

  // Friends
  if (currentSection === "friends") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <Friends
          onBack={() => setCurrentSection("dashboard")}
          onViewProfile={(userId: string) => {
            setViewingUserId(userId);
            setCurrentSection("profile");
          }}
        />
      </Box>
    );
  }

  // Leaderboard
  if (currentSection === "leaderboard") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <Leaderboard
          onBack={() => setCurrentSection("dashboard")}
          onViewProfile={(userId: string) => {
            setViewingUserId(userId);
            setCurrentSection("profile");
          }}
        />
      </Box>
    );
  }

  // Chat
  if (currentSection === "chat") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <ChatInbox
          onBack={() => setCurrentSection("dashboard")}
          onViewProfile={(userId: string) => {
            setViewingUserId(userId);
            setCurrentSection("profile");
          }}
        />
      </Box>
    );
  }

  // Notifications
  if (currentSection === "notifications") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <NotificationBell
          onViewUserProfile={(userId: string) => {
            setViewingUserId(userId);
            setCurrentSection("profile");
          }}
          onBack={() => setCurrentSection("dashboard")}
        />
      </Box>
    );
  }

  // Snippets
  if (currentSection === "snippets") {
    return (
      <Box minH="100vh" bg="#0f0a19" color="gray.500" p={6}>
        <SnippetLibrary onBack={() => setCurrentSection("dashboard")} />
      </Box>
    );
  }

  // PostgreSQL
  if (currentSection === "postgres") {
    return (
      <PostgresProblems
        problems={POSTGRES_PROBLEMS}
        onBack={() => setCurrentSection("dashboard")}
      />
    );
  }

  // Pandas/Numpy
  if (currentSection === "pandas") {
    return (
      <GenericTopics
        topics={PANDAS_NUMPY_TOPICS}
        title="Pandas & NumPy"
        icon={FiCpu}
        colorScheme="orange"
        onBack={() => setCurrentSection("dashboard")}
      />
    );
  }

  // Airflow
  if (currentSection === "airflow") {
    return (
      <GenericTopics
        topics={AIRFLOW_TOPICS}
        title="Apache Airflow"
        icon={FiServer}
        colorScheme="teal"
        onBack={() => setCurrentSection("dashboard")}
      />
    );
  }

  // Spark
  if (currentSection === "spark") {
    return (
      <GenericTopics
        topics={SPARK_TOPICS}
        title="Apache Spark"
        icon={FiZap}
        colorScheme="red"
        onBack={() => setCurrentSection("dashboard")}
      />
    );
  }

  // Achievements
  if (currentSection === "achievements") {
    return (
      <Achievements
        onBack={() => setCurrentSection("dashboard")}
      />
    );
  }

  // Stats
  if (currentSection === "stats") {
    return (
      <Stats
        onBack={() => setCurrentSection("dashboard")}
      />
    );
  }

  // Code Templates
  if (currentSection === "templates") {
    return (
      <CodeTemplates
        onBack={() => setCurrentSection("dashboard")}
        onLoadTemplate={(code) => {
          // Could set code in sandbox or live coding
          console.log("Loading template:", code);
        }}
      />
    );
  }

  // User Profile
  if (currentSection === "profile") {
    return (
      <UserProfile
        onBack={() => {
          setCurrentSection("dashboard");
          setViewingUserId(null);
        }}
        viewingUserId={viewingUserId}
      />
    );
  }

  // Live Coding (Code Editor)
  if (currentSection === "live-coding" && roomId) {
    return (
      <LiveCoding
        onBack={() => {
          setCurrentSection("dashboard");
          setRoomId(null);
        }}
        initialRoomId={roomId}
      />
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
  return <AppRoutes />;
}

export default App;

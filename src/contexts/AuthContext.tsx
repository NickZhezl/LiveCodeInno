import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../main";

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: Date;
  color?: string;
  nicknameColor?: string;
  tags?: string[];
  customTag?: string;
  bio?: string;
  level?: number;
  xp?: number;
  avatarUrl?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
  signUp: async () => {},
  login: async () => {},
  logout: async () => {},
  isAdmin: false,
  refreshUserData: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  async function signUp(email: string, password: string, displayName: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      role: "user",
      createdAt: serverTimestamp(),
    });
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
    setUserData(null);
  }

  async function fetchUserData(user: User) {
    try {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid: data.uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role || "user",
          createdAt: data.createdAt?.toDate() || new Date(),
          color: data.color || "purple.600",
          nicknameColor: data.nicknameColor || data.color || "purple.600",
          tags: data.tags || [],
          customTag: data.customTag || "",
          bio: data.bio || "",
          level: data.level || 1,
          xp: data.xp || 0,
          avatarUrl: data.avatarUrl || "",
        });
      } else {
        // Create user document if it doesn't exist
        const userData: UserData = {
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || "",
          role: "user",
          createdAt: new Date(),
          color: "purple.600",
          nicknameColor: "purple.600",
          tags: [],
          customTag: "",
          bio: "",
          level: 1,
          xp: 0,
          avatarUrl: "",
        };
        await setDoc(doc(firestore, "users", user.uid), userData);
        setUserData(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  async function refreshUserData() {
    if (currentUser) {
      await fetchUserData(currentUser);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signUp,
    login,
    logout,
    isAdmin: userData?.role === "admin",
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

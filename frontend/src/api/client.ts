// API client for FastAPI backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/api";

// ============== ROOMS ==============

export async function createRoom(roomId: string, language: string) {
  const response = await fetch(`${API_URL}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: roomId, language }),
  });
  if (!response.ok) throw new Error("Failed to create room");
  return response.json();
}

export async function getRoom(roomId: string) {
  const response = await fetch(`${API_URL}/rooms/${roomId}`);
  if (!response.ok) throw new Error("Room not found");
  return response.json();
}

export async function updateRoomLanguage(roomId: string, language: string) {
  const response = await fetch(`${API_URL}/rooms/${roomId}?language=${encodeURIComponent(language)}`, {
    method: "PUT",
  });
  if (!response.ok) throw new Error("Failed to update room");
  return response.json();
}

// ============== LEADERBOARD ==============

export async function submitLeaderboardEntry(
  roomId: string,
  entry: {
    user_name: string;
    problem_id: string;
    problem_title: string;
    time_seconds: number;
    language: string;
  }
) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/leaderboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error("Failed to submit leaderboard entry");
  return response.json();
}

export async function getLeaderboard(roomId: string, problemId?: string, limit = 10) {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (problemId) params.set("problem_id", problemId);
  
  const response = await fetch(`${API_URL}/rooms/${roomId}/leaderboard?${params}`);
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  return response.json();
}

// ============== CODE VERSIONS ==============

export async function saveCodeVersion(
  roomId: string,
  version: {
    file_name?: string;
    code: string;
    language?: string;
    saved_by?: string;
  }
) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(version),
  });
  if (!response.ok) throw new Error("Failed to save code");
  return response.json();
}

export async function getCodeVersions(roomId: string, limit = 20) {
  const response = await fetch(`${API_URL}/rooms/${roomId}/code?limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch code versions");
  return response.json();
}

// ============== WEBSOCKET ==============

export function createRoomWebSocket(roomId: string) {
  const ws = new WebSocket(`${WS_URL}/ws/rooms/${roomId}`);
  return ws;
}

export function createYjsWebSocket(roomId: string) {
  const ws = new WebSocket(`ws://${window.location.hostname}:8000/yjs/${roomId}`);
  return ws;
}

// ============== UTILS ==============

export function getApiUrl() {
  return API_URL;
}

export function getWsUrl() {
  return WS_URL;
}

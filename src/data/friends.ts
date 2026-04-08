// Friends system data types and utilities
export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
}

export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: any;
}

export interface FriendData {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  nicknameColor?: string;
  customTag?: string;
  role: "user" | "admin";
}

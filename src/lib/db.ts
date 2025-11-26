import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");
const INTRO_META_FILE = path.join(DATA_DIR, "intro.meta.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(REQUESTS_FILE)) {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify([]));
}

// Types
export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  isAdmin: boolean;
  createdAt: string;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  reason: string;
  category: "Student" | "Working";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface IntroMeta {
  uploadedAt: string;
  uploader: string;
}

// Hash password (simple for demo - use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Users
export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]): void {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function createUser(username: string, password: string, isAdmin = false): User {
  const users = getUsers();
  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    password: hashPassword(password),
    isAdmin,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function findUser(username: string, password: string): User | null {
  const users = getUsers();
  const hashedPassword = hashPassword(password);
  return users.find((u) => u.username === username && u.password === hashedPassword) || null;
}

// Initialize admin user if not exists
export function initializeAdmin(): void {
  const users = getUsers();
  const adminId = process.env.ADMIN_ID || "devilbaby";
  const adminPass = process.env.ADMIN_PASS || "Har Har Mahadev Ji";
  
  const adminExists = users.find((u) => u.username === adminId && u.isAdmin);
  if (!adminExists) {
    createUser(adminId, adminPass, true);
    console.log("✅ Admin user created:", adminId);
  }
}

// Access Requests
export function getAccessRequests(): AccessRequest[] {
  try {
    const data = fs.readFileSync(REQUESTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveAccessRequests(requests: AccessRequest[]): void {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

export function createAccessRequest(
  name: string,
  email: string,
  reason: string,
  category: "Student" | "Working"
): AccessRequest {
  const requests = getAccessRequests();
  const newRequest: AccessRequest = {
    id: `req_${Date.now()}`,
    name,
    email,
    reason,
    category,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  saveAccessRequests(requests);
  return newRequest;
}

export function updateRequestStatus(
  requestId: string,
  status: "approved" | "rejected"
): AccessRequest | null {
  const requests = getAccessRequests();
  const request = requests.find((r) => r.id === requestId);
  if (!request) return null;
  
  request.status = status;
  saveAccessRequests(requests);
  return request;
}

// Intro Video Metadata
export function getIntroMeta(): IntroMeta | null {
  try {
    if (fs.existsSync(INTRO_META_FILE)) {
      const data = fs.readFileSync(INTRO_META_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch {
    return null;
  }
  return null;
}

export function saveIntroMeta(uploader: string): void {
  const meta: IntroMeta = {
    uploadedAt: new Date().toISOString(),
    uploader,
  };
  fs.writeFileSync(INTRO_META_FILE, JSON.stringify(meta, null, 2));
}

// JWT utilities (simple token generation for demo)
export function generateToken(userId: string, username: string, isAdmin: boolean): string {
  const payload = { userId, username, isAdmin, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

export function verifyToken(token: string): { userId: string; username: string; isAdmin: boolean } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, username: payload.username, isAdmin: payload.isAdmin };
  } catch {
    return null;
  }
}

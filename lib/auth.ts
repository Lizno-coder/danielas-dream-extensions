import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key");

export interface AuthPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
}

export async function verifyAuth(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthPayload;
  } catch {
    return null;
  }
}

export async function requireAuth(token: string | undefined): Promise<AuthPayload> {
  if (!token) {
    throw new Error("Nicht authentifiziert");
  }
  
  const payload = await verifyAuth(token);
  if (!payload) {
    throw new Error("Ungültiger Token");
  }
  
  return payload;
}

export async function requireAdmin(token: string | undefined): Promise<AuthPayload> {
  const payload = await requireAuth(token);
  
  if (payload.role !== "admin") {
    throw new Error("Admin-Zugriff erforderlich");
  }
  
  return payload;
}

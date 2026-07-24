export interface SessionUser {
  id: string;
  role: "ADMIN" | "CUSTOMER";
  fullName: string;
  mobileNumber: string;
  email: string | null;
}

export interface StoredUser extends SessionUser {
  passwordHash?: string;
}

// In-memory store fallback for demo & offline mode
const memoryUsers: Map<string, StoredUser> = new Map();

// Default Super Admin User (scrypt hashed password for 'admin25')
const DEFAULT_ADMIN: StoredUser = {
  id: "admin-master-001",
  fullName: "Super Admin",
  mobileNumber: "9999999999",
  email: "admin@artiaircon.com",
  role: "ADMIN",
  passwordHash: "1d5aefc768f2290c7894131645ed5a96:05cc2f9fc4747215355f346fdbe7835992d4c59b6b98121ed248e2930c37811f8c4c4c4c1e7982c8a65017c3c85182bf9cb045106e9dd4094840d45494b980df",
};

memoryUsers.set("admin@artiaircon.com", DEFAULT_ADMIN);
memoryUsers.set("admin", DEFAULT_ADMIN);
memoryUsers.set("9999999999", DEFAULT_ADMIN);

export function findMemoryUser(key: string): StoredUser | undefined {
  // Completely disable in-memory user lookup in production environments
  if (process.env.NODE_ENV === "production") return undefined;

  const normalizedKey = key.trim().toLowerCase().replace(/[\s-]/g, "");
  for (const [k, u] of memoryUsers.entries()) {
    if (
      k.toLowerCase() === normalizedKey ||
      u.email?.toLowerCase() === normalizedKey ||
      u.mobileNumber.replace(/[\s-]/g, "") === normalizedKey ||
      u.id === key
    ) {
      return u;
    }
  }
  return undefined;
}

export function saveMemoryUser(user: StoredUser): StoredUser {
  memoryUsers.set(user.mobileNumber, user);
  if (user.email) {
    memoryUsers.set(user.email.toLowerCase(), user);
  }
  return user;
}

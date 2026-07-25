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

// Default Super Admin User (scrypt hashed password for 'Arti@22')
const DEFAULT_ADMIN: StoredUser = {
  id: "admin-master-001",
  fullName: "Super Admin",
  mobileNumber: "9264173334",
  email: "admin@artiaircon.com",
  role: "ADMIN",
  passwordHash: "874e3ee66f7dadea79789690d30a97eb:f6715dd185e5a86fdd6c68b2826e3765d45223d23e8a602fb947fff448ce9061d9e1d7fb051a5500c53700a80c77ecb3e07ef6c985af90717e5cda08cf304e67",
};

memoryUsers.set("admin@artiaircon.com", DEFAULT_ADMIN);
memoryUsers.set("admin", DEFAULT_ADMIN);
memoryUsers.set("9264173334", DEFAULT_ADMIN);

export function findMemoryUser(key: string): StoredUser | undefined {
  const normalizedKey = key.trim().toLowerCase().replace(/[\s-]/g, "").replace(/^\+91/, "");
  for (const [k, u] of memoryUsers.entries()) {
    const kNorm = k.toLowerCase().replace(/[\s-]/g, "").replace(/^\+91/, "");
    const uMobileNorm = u.mobileNumber.replace(/[\s-]/g, "").replace(/^\+91/, "");
    if (
      kNorm === normalizedKey ||
      u.email?.toLowerCase() === normalizedKey ||
      uMobileNorm === normalizedKey ||
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

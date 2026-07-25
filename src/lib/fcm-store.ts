export type StoredFcmToken = {
  id: string;
  userId: string;
  userRole?: "ADMIN" | "CUSTOMER";
  token: string;
  deviceType: string;
  createdAt: string;
  updatedAt: string;
};

// In-memory token storage (used in development or DB offline mode)
export const inMemoryFcmTokens: StoredFcmToken[] = [];

export function saveInMemoryFcmToken(userId: string, token: string, userRole?: "ADMIN" | "CUSTOMER", deviceType = "web"): StoredFcmToken {
  const existingIndex = inMemoryFcmTokens.findIndex((t) => t.token === token);
  const now = new Date().toISOString();

  if (existingIndex !== -1) {
    inMemoryFcmTokens[existingIndex] = {
      ...inMemoryFcmTokens[existingIndex],
      userId,
      userRole,
      deviceType,
      updatedAt: now,
    };
    return inMemoryFcmTokens[existingIndex];
  }

  const newToken: StoredFcmToken = {
    id: `token-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    userRole,
    token,
    deviceType,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryFcmTokens.push(newToken);
  return newToken;
}

export function removeInMemoryFcmToken(token: string): boolean {
  const initialLength = inMemoryFcmTokens.length;
  const filtered = inMemoryFcmTokens.filter((t) => t.token !== token);
  inMemoryFcmTokens.length = 0;
  inMemoryFcmTokens.push(...filtered);
  return inMemoryFcmTokens.length < initialLength;
}

export function getInMemoryFcmTokensForUser(userId: string): string[] {
  return inMemoryFcmTokens.filter((t) => t.userId === userId).map((t) => t.token);
}

export function getInMemoryFcmTokensForRole(role: "ADMIN" | "CUSTOMER"): string[] {
  return inMemoryFcmTokens.filter((t) => t.userRole === role).map((t) => t.token);
}

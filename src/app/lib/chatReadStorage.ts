const STORAGE_PREFIX = "planthub:chat:last-read:";

type SerializableMap = Record<string, number>;

const isBrowser = typeof window !== "undefined";

const buildStorageKey = (userId: string) => `${STORAGE_PREFIX}${userId}`;

export function loadChatReadState(userId: string): Map<string, number> {
  if (!isBrowser) {
    return new Map();
  }

  try {
    const raw = window.localStorage.getItem(buildStorageKey(userId));
    if (!raw) {
      return new Map();
    }

    const parsed = JSON.parse(raw) as SerializableMap;
    return new Map(
      Object.entries(parsed).map(([chatId, value]) => [chatId, Number(value) || 0])
    );
  } catch (error) {
    console.error("Failed to load chat read state", error);
    return new Map();
  }
}

export function persistChatReadState(userId: string, map: Map<string, number>) {
  if (!isBrowser) {
    return;
  }

  const key = buildStorageKey(userId);

  try {
    if (map.size === 0) {
      window.localStorage.removeItem(key);
      return;
    }

    const serializable: SerializableMap = {};
    map.forEach((value, chatId) => {
      serializable[chatId] = value;
    });

    window.localStorage.setItem(key, JSON.stringify(serializable));
  } catch (error) {
    console.error("Failed to persist chat read state", error);
  }
}

export function clearChatReadState(userId: string) {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(buildStorageKey(userId));
  } catch (error) {
    console.error("Failed to clear chat read state", error);
  }
}

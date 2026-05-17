export const TYPE_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  Fire: { bg: "#FF6B35", text: "#fff", glow: "rgba(255,107,53,0.6)" },
  Water: { bg: "#2196F3", text: "#fff", glow: "rgba(33,150,243,0.6)" },
  Grass: { bg: "#4CAF50", text: "#fff", glow: "rgba(76,175,80,0.6)" },
  Electric: { bg: "#FFD600", text: "#1a1a1a", glow: "rgba(255,214,0,0.6)" },
  Psychic: { bg: "#E91E63", text: "#fff", glow: "rgba(233,30,99,0.6)" },
  Ice: { bg: "#80DEEA", text: "#1a1a1a", glow: "rgba(128,222,234,0.6)" },
  Dragon: { bg: "#6C3EC6", text: "#fff", glow: "rgba(108,62,198,0.6)" },
  Dark: { bg: "#37474F", text: "#fff", glow: "rgba(55,71,79,0.6)" },
  Fairy: { bg: "#F48FB1", text: "#1a1a1a", glow: "rgba(244,143,177,0.6)" },
  Normal: { bg: "#9E9E9E", text: "#fff", glow: "rgba(158,158,158,0.6)" },
  Fighting: { bg: "#D32F2F", text: "#fff", glow: "rgba(211,47,47,0.6)" },
  Flying: { bg: "#90A4AE", text: "#1a1a1a", glow: "rgba(144,164,174,0.6)" },
  Poison: { bg: "#9C27B0", text: "#fff", glow: "rgba(156,39,176,0.6)" },
  Ground: { bg: "#8D6E63", text: "#fff", glow: "rgba(141,110,99,0.6)" },
  Rock: { bg: "#78909C", text: "#fff", glow: "rgba(120,144,156,0.6)" },
  Bug: { bg: "#8BC34A", text: "#1a1a1a", glow: "rgba(139,195,74,0.6)" },
  Ghost: { bg: "#512DA8", text: "#fff", glow: "rgba(81,45,168,0.6)" },
  Steel: { bg: "#B0BEC5", text: "#1a1a1a", glow: "rgba(176,190,197,0.6)" },
};

export const getTypeStyle = (type: string) =>
  TYPE_COLORS[type] ?? { bg: "#888", text: "#fff", glow: "rgba(136,136,136,0.4)" };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CacheEnvelope<T> {
  data: T;
  expiry: number;
}

// Save to localStorage with a Time-To-Live (default 1 day)
export function setStorageWithExpiry<T>(key: string, value: T, ttl: number = ONE_DAY_MS): void {
  if (typeof window === "undefined") return;
  const envelope: CacheEnvelope<T> = {
    data: value,
    expiry: Date.now() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(envelope));
}

// Retrieve from localStorage and validate expiry
export function getStorageWithExpiry<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const envelope: CacheEnvelope<T> = JSON.parse(itemStr);
    
    // Check if the item has expired
    if (Date.now() > envelope.expiry) {
      localStorage.removeItem(key); // Clean up expired item
      return null;
    }
    
    return envelope.data;
  } catch (e) {
    // If parsing fails, remove the corrupted cache item
    localStorage.removeItem(key);
    return null;
  }
}


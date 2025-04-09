
export function loadFromStorage<T>(key: string): T | null {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      console.error('❌ JSON parse error:', err);
    }
  }
  return null;
};

export function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

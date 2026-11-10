// Safe access to localStorage. Storage can be blocked (for example in some
// private windows or by school device policies), so failures are not fatal.

export function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save "${key}":`, error);
  }
}

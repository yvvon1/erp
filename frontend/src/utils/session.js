export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem("user");
};

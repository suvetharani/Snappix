// src/context/AuthContext.js

import { createContext, useState, useContext } from "react";

// 1️⃣ Create the context
const AuthContext = createContext();

// 2️⃣ Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3️⃣ Custom hook for easy usage
export function useAuth() {
  return useContext(AuthContext);
}

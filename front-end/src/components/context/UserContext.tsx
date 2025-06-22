
"use client";
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

type User = {
  username: string;
  email: string;
  role?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const base_url = "http://localhost:8080";

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

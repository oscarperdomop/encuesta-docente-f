import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { me, type MeOut } from "@/services/auth";

type UserContextType = {
  user: (MeOut & { isAdmin: boolean }) | null;
  loading: boolean;
  refetch: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(MeOut & { isAdmin: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await me();
      setUser(userData);
    } catch (error) {
      console.error("[UserContext] Error fetching user:", error);
      setUser(null);
      localStorage.removeItem("token");
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

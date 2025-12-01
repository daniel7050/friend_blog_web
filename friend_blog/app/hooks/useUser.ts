import { useAuth } from "../context/AuthContext";

// Re-export useAuth so existing `useUser` imports continue to work
export const useUser = useAuth;

import { createContext, useContext, useEffect } from "react";
import socket from "../socket";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext(); 

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

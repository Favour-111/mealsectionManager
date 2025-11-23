import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    const baseUrl =
      import.meta.env.VITE_REACT_APP_API || "http://localhost:5000";
    socket = io(baseUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
}

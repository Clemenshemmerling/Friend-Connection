import React, { useEffect } from "react";

interface WebSocketAlertProps {
  socket: WebSocket;
  fetchUsers: () => void;
  fetchFriends: () => void;
}

const WebSocketAlert: React.FC<WebSocketAlertProps> = ({
  socket,
  fetchUsers,
  fetchFriends,
}) => {
  useEffect(() => {
    const handleUpdate = (event: MessageEvent) => {
      console.log("Received raw data:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("Parsed data:", data);
        if (data.type === "update") {
          fetchUsers();
          fetchFriends();
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };

    socket.addEventListener("message", handleUpdate);
    return () => {
      socket.removeEventListener("message", handleUpdate);
    };
  }, [socket, fetchUsers, fetchFriends]);

  return null;
};

export default WebSocketAlert;

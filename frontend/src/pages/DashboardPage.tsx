import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import FriendList from "../components/FriendList";
import UserSearch from "../components/UserSearch";
import FriendRequests from "../components/FriendRequests";
import AutoDismissAlert from "../components/AutoDismissAlert";
import { User } from "../types/types";

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // Establish socket connection
  if (user) {
    const newSocket = io("http://localhost:3001", {
      transports: ["websocket"], // Use WebSocket for transport
    });

    newSocket.on("new-data", () => {
      fetchData(); // Fetch all data when an update notification is received
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  useEffect(() => {
    const setupWebSocket = () => {
      ws.current = new WebSocket("ws://localhost:8000/ws");
      ws.current.onopen = () => {
        console.log("WS Connected");
      };
      ws.current.onmessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        console.log("WS Receives: ", data);
        fetchData(); // Fetch data whenever a message is received
      };
      ws.current.onclose = () => {
        console.log("WS Disconnected");
        setTimeout(setupWebSocket, 3000); // Reconnect every 3 seconds upon disconnection
      };
      ws.current.onerror = (err: Event) => {
        console.error("WebSocket Error:", err);
      };
    };

    setupWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const fetchData = async () => {
    if (!user) return;
    setUsers([]);
    setFriends([]);
    setFriendRequests([]);
    try {
      const friendsResponse = await fetch(
        `http://localhost:8000/friends/${user?.id}`
      );
      const usersResponse = await fetch(
        `http://localhost:8000/users/?current_user_id=${user?.id}`
      );
      const friendRequestsResponse = await fetch(
        `http://localhost:8000/friend-requests/received/${user?.id}`
      );

      const friendsData = await friendsResponse.json();
      const usersData = await usersResponse.json();
      const friendRequestsData = await friendRequestsResponse.json();

      if (friendsResponse.ok) setFriends(friendsData);
      if (usersResponse.ok) setUsers(usersData);
      if (friendRequestsResponse.ok) setFriendRequests(friendRequestsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlertMessage("Failed to fetch data.");
    }
  };

  const handleAcceptFriendRequest = async (requestId: number) => {
    const response = await fetch(
      `http://localhost:8000/friend-requests/${requestId}/accept`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      fetchData(); // Refresh data to reflect changes
    } else {
      alert("Failed to accept friend request.");
    }
  };

  const handleBlockUser = async (userId: Number) => {
    await fetch(`http://localhost:8000/block-user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    fetchData();
  };

  useEffect(() => {
    fetchData(); // Fetch all data on component mount or user change
  }, [user]);

  const handleSendFriendRequest = async (userId: number) => {
    const response = await fetch(`http://localhost:8000/friend-requests/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requester_id: user?.id,
        requestee_id: userId,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      fetchData(); // Re-fetch data to update the state after the action
    } else {
      alert("Error sending friend request");
    }
  };

  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex-1"></div>
        <div className="flex flex-col items-center">
          <img
            src={user?.avatar_url}
            alt={`${user?.username}'s avatar`}
            className="w-20 h-20 rounded-full"
          />
          <h1 className="text-xl font-bold mt-2">{user?.username}</h1>
        </div>
        <div className="text-right flex-1">
          <button
            onClick={handleLogoutClick}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-bold">Friends</h2>
        <FriendList friends={friends} />
      </div>
      <div className="my-8">
        <h2 className="text-lg font-bold">Search Users</h2>
        <UserSearch
          users={users}
          onSendRequest={handleSendFriendRequest}
          onBlockUser={handleBlockUser}
        />
      </div>
      <div className="my-8">
        <h2 className="text-lg font-bold">Friend Requests</h2>
        <FriendRequests
          onBlock={handleBlockUser}
          onAccept={handleAcceptFriendRequest}
          friendRequests={friendRequests}
        />
      </div>
      {alertMessage && (
        <AutoDismissAlert
          message={alertMessage}
          onDismiss={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;

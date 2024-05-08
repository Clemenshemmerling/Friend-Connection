import React from "react";

interface User {
  id: number;
  username: string;
  avatar_url: string;
}

interface FriendRequestsProps {
  friendRequests: User[];
  onAccept: (requestId: number) => void;
  onBlock: (userId: number) => void;
}

const FriendRequests: React.FC<FriendRequestsProps>  = ({ friendRequests, onAccept, onBlock }) => {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {friendRequests.map((request) => (
        <div key={request.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            {request && request.avatar_url ? (
              <img
                src={request.avatar_url}
                alt={request.username}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300">No Image</div>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {request
                  ? request.username
                  : "Unknown User"}
              </h2>
            </div>
          </div>
          <div className="flex justify-around mt-4">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => onAccept(request.id)}
            >
              Accept
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => onBlock(request.id)}
            >
              Block
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;

import React from 'react';
import { User } from 'types/types';

interface UserCardProps {
  user: User;
  onSendRequest: (userId: number) => void;
  onBlockUser: (userId: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSendRequest, onBlockUser }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center mb-4 space-y-2">
      <img src={user.avatar_url} alt={`${user.username}'s avatar`} className="w-24 h-24 rounded-full" />
      <h3 className="text-lg font-bold">{user.username}</h3>
      <p className="text-sm">{user.email}</p>
      <p className="text-sm">Status: {user.status}</p>
      <div className="flex mt-2 space-x-2 w-full justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm flex-1"
          onClick={() => onSendRequest(user.id)}
        >
          Send Friend Request
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm flex-1"
          onClick={() => onBlockUser(user.id)}
        >
          Block User
        </button>
      </div>
    </div>
  );
};

export default UserCard;

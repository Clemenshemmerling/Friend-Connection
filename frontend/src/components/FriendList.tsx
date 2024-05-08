import React from 'react';

interface Friend {
  id: number;
  username: string;
  status: string;
  avatar_url: string;
}

interface FriendListProps {
  friends: Friend[];
}

const FriendList: React.FC<FriendListProps> = ({ friends }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Friends</h2>
      <div className="flex flex-wrap gap-4">
        {friends.map(friend => (
          <div key={friend.id} className="bg-blue-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out p-4 flex items-center space-x-4">
            <img
              src={friend.avatar_url || 'https://via.placeholder.com/150/CDCDCD/808080?Text=Digital.com'}
              alt={`${friend.username}'s avatar`}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold">{friend.username}</h3>
              <p className="text-sm text-gray-600">{friend.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;

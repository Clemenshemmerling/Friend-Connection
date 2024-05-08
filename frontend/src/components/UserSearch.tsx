import React, { useState, useEffect } from 'react';
import UserCard from './UserCard';
import { User } from 'types/types';

interface UserSearchProps {
  users: User[];
  onSendRequest: (userId: number) => void;
  onBlockUser: (userId: number) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ users, onSendRequest, onBlockUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search users"
        className="mb-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onSendRequest={onSendRequest}
            onBlockUser={onBlockUser}
          />
        ))}
      </div>
    </div>
  );
};

export default UserSearch;

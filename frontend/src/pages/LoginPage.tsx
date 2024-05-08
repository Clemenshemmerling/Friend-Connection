import React from 'react';
import LoginForm from '../components/LoginForm';

interface LoginPageProps {
  handleLogin: (email: string, password: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <LoginForm handleLogin={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;

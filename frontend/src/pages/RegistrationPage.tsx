import React from 'react';
import RegistrationForm from '../components/RegistrationForm';
import { useNavigate } from 'react-router-dom';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Registration failed:", response.status);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Register for an account</h2>
        </div>
        <RegistrationForm handleRegister={handleRegister} />
      </div>
    </div>
  );
};

export default RegistrationPage;

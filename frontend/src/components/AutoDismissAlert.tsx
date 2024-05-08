import React, { useEffect } from 'react';

interface AutoDismissAlertProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

const AutoDismissAlert: React.FC<AutoDismissAlertProps> = ({ message, onDismiss, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className="fixed top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded transition-opacity duration-300">
      {message}
    </div>
  );
};

export default AutoDismissAlert;

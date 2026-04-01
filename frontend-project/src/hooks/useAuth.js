import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  
  const getSafeUser = () => {
    try {
      const savedUser = localStorage.getItem('user');
      
      // If it's null, or the literal string "undefined", return null
      if (!savedUser || savedUser === "undefined") {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      // If the JSON is corrupted, clear it and return null
      console.error("Auth Error: Invalid JSON in storage", error);
      return null;
    }
  };

  const [user, setUser] = useState(getSafeUser());

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/');
  };

  return { user, logout };
};
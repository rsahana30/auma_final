import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const Account = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUser(null);
      }
    }
  }, []);

  return (
    <div>
      <h1>Account Page</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Please sign in to view account details.</p>
      )}
    </div>
  );
};

export default Account;
import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

export default function ViewUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiService.request('/api/users')
      .then(setUsers)
      .catch((err) => {
        console.error('Error loading users:', err);
      });
  }, []);

  return (
    <div>
      <h2>👥 Registered Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
}

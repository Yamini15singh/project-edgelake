// import { useEdgelake } from './hooks/useEdgelake';
// import { apiService } from './services/apiService';
// import { useEffect } from 'react';

// function App() {
//   const isLocal = useEdgelake();

//   useEffect(() => {
//     apiService.setLocalAvailability(isLocal);
//   }, [isLocal]);

//   const loadData = async () => {
//     try {
//       const data = await apiService.request('/status');
//       alert(`Source: ${data.source}`);
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   return (
//     <main style={{ padding: '2rem' }}>
//       <h1>Edge-Aware Web App</h1>

//       <p>Mode: {isLocal ? '🟢 Local (Edgelake)' : '☁️ Cloud Fallback'}</p>
//       <button onClick={loadData}>Load Status</button>
//     </main>
//   );
// }

// export default App;

// import { useEdgelake } from './hooks/useEdgelake';
// import { apiService } from './services/apiService';
// import { useEffect } from 'react';

// function App() {
//   const isLocal = useEdgelake();

//   useEffect(() => {
//     apiService.setLocalAvailability(isLocal);
//   }, [isLocal]);

//   const loadData = async () => {
//     try {
//       const data = await apiService.request('/status');
//       alert(`Source: ${data.source}`);
//     } catch (err) {
//       alert(`Error: ${err.message}`);
//     }
//   };

//   return (
//     <main style={{ padding: '2rem' }}>
//       <h1>Edge-Aware Web App</h1>
//       <h2 style={{ color: 'red' }}>🚀 Auto-deploy test: This line came from GitHub!</h2>
//       <p>Mode: {isLocal ? '🟢 Local (Edgelake)' : '☁️ Cloud Fallback'}</p>
//       <button onClick={loadData}>Load Status</button>
//     </main>
//   );
// }

// export default App;

// import { useEdgelake } from './hooks/useEdgelake';
// import { apiService } from './services/apiService';
// import { useEffect } from 'react';
// import Login from './components/Login';

// function App() {
//   const isLocal = useEdgelake();

//   useEffect(() => {
//     apiService.setLocalAvailability(isLocal);
//   }, [isLocal]);

//   return (
//     <main style={{ padding: '2rem' }}>
//       <h1>🧠 EdgeLake Login Test</h1>
//       <p>Mode: {isLocal ? '🟢 Local Edge' : '☁️ Cloud'}</p>
//       <Login />
//     </main>
//   );
// }

// export default App;

import { useEffect, useState } from 'react';
import { useEdgelake } from './hooks/useEdgelake';
import { apiService } from './services/apiService';
import Login from './components/Login';
import Signup from './components/Signup';
import ViewUsers from './components/ViewUsers';

function App() {
  const isLocal = useEdgelake();
  const [mode, setMode] = useState('login');

  useEffect(() => {
    apiService.setLocalAvailability(isLocal);
  }, [isLocal]);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🧠 EdgeLake User Portal</h1>
      <p>Mode: {isLocal ? '🟢 Local Edge' : '☁️ Cloud'}</p>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setMode('login')}>🔐 Login</button>
        <button onClick={() => setMode('signup')}>📝 Signup</button>
        <button onClick={() => setMode('users')}>📋 View Users</button>
      </div>

      {mode === 'login' && <Login />}
      {mode === 'signup' && <Signup />}
      {mode === 'users' && <ViewUsers />}
    </main>
  );
}

export default App;


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

import { useEdgelake } from './hooks/useEdgelake';
import { apiService } from './services/apiService';
import { useEffect } from 'react';

function App() {
  const isLocal = useEdgelake();

  useEffect(() => {
    apiService.setLocalAvailability(isLocal);
  }, [isLocal]);

  const loadData = async () => {
    try {
      const data = await apiService.request('/status');
      alert(`Source: ${data.source}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Edge-Aware Web App</h1>
      <h2 style={{ color: 'red' }}>🚀 Auto-deploy test: This line came from GitHub!</h2>
      <p>Mode: {isLocal ? '🟢 Local (Edgelake)' : '☁️ Cloud Fallback'}</p>
      <button onClick={loadData}>Load Status</button>
    </main>
  );
}

export default App;

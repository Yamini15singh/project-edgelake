// import { useState, useEffect } from 'react';

// export function useEdgelake(pollInterval = 10000) {
//   const [isLocalAvailable, setIsLocalAvailable] = useState(false);
//   const LOCAL_PING_URL = 'http://192.168.21.170:8080/ping';

//   const check = async () => {
//     try {
//       const controller = new AbortController();
//       const timeout = setTimeout(() => controller.abort(), 2000);
//       const res = await fetch(LOCAL_PING_URL, { signal: controller.signal });
//       clearTimeout(timeout);
//       setIsLocalAvailable(res.ok);
//     } catch {
//       setIsLocalAvailable(false);
//     }
//   };

//   useEffect(() => {
//     check();
//     const interval = setInterval(check, pollInterval);
//     return () => clearInterval(interval);
//   }, []);

//   return isLocalAvailable;
// }

// import { useState, useEffect } from 'react';

// export function useEdgelake(pollInterval = 10000) {
//   const [isLocalAvailable, setIsLocalAvailable] = useState(false);
//   const LOCAL_PING_URL = 'http://192.168.29.155:8080/ping'; // Replace with your IP

//   const checkEdgelakeAvailability = async () => {
//     try {
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

//       const res = await fetch(LOCAL_PING_URL, { signal: controller.signal });
//       clearTimeout(timeoutId);

//       if (res.ok) {
//         setIsLocalAvailable(true);
//       } else {
//         setIsLocalAvailable(false);
//       }
//     } catch (err) {
//       // If fetch fails or times out, fallback to cloud
//       setIsLocalAvailable(false);
//     }
//   };

//   useEffect(() => {
//     checkEdgelakeAvailability(); // check on first load
//     const interval = setInterval(checkEdgelakeAvailability, pollInterval); // check every 10s
//     return () => clearInterval(interval);
//   }, []);

//   return isLocalAvailable;
// }

// export const useEdgelake = () => {
//   const host = window.location.hostname;
//   return host === 'localhost' || host.startsWith('192.168.');
// };

// src/hooks/useEdgelake.js

import { useState, useEffect } from 'react';

/**
 * Custom hook to check availability of the local EdgeLake API.
 * It tries to ping the local server periodically and returns true if reachable.
 * 
 * @param {number} pollInterval - Time between checks (in milliseconds)
 * @returns {boolean} Whether the local backend is reachable
 */
export function useEdgelake(pollInterval = 10000) {
  const [isLocalAvailable, setIsLocalAvailable] = useState(false);

  // Replace this IP with your actual local IP if needed
  const LOCAL_PING_URL = 'http://192.168.94.232:8080/ping';

  const checkEdgelakeAvailability = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // timeout after 2s

      const res = await fetch(LOCAL_PING_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      setIsLocalAvailable(res.ok);
    } catch (err) {
      // Fetch failed or timed out → fallback to cloud
      setIsLocalAvailable(false);
    }
  };

  useEffect(() => {
    checkEdgelakeAvailability(); // run once on mount
    const interval = setInterval(checkEdgelakeAvailability, pollInterval);
    return () => clearInterval(interval); // clean up
  }, [pollInterval]); // ✅ include pollInterval to satisfy ESLint

  return isLocalAvailable;
}

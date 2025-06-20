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

import { useState, useEffect } from 'react';

export function useEdgelake(pollInterval = 10000) {
  const [isLocalAvailable, setIsLocalAvailable] = useState(false);
  const LOCAL_PING_URL = 'http://192.168.21.170:8080/ping'; // Replace with your IP

  const checkEdgelakeAvailability = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

      const res = await fetch(LOCAL_PING_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        setIsLocalAvailable(true);
      } else {
        setIsLocalAvailable(false);
      }
    } catch (err) {
      // If fetch fails or times out, fallback to cloud
      setIsLocalAvailable(false);
    }
  };

  useEffect(() => {
    checkEdgelakeAvailability(); // check on first load
    const interval = setInterval(checkEdgelakeAvailability, pollInterval); // check every 10s
    return () => clearInterval(interval);
  }, []);

  return isLocalAvailable;
}

// // import { useState } from 'react';
// // import { apiService } from '../services/apiService';

// // export default function Login() {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [message, setMessage] = useState('');

// //   const handleLogin = async (e) => {
// //     e.preventDefault();
// //     try {
// //       const res = await apiService.request('/api/login', {
// //         method: 'POST',
// //         body: JSON.stringify({ email, password }),
// //         headers: { 'Content-Type': 'application/json' }
// //       });
// //       console.log("🔁 Local API response:", res);
// //       setMessage(res.message);
// //     } catch (err) {
// //       console.error("❌ Login failed:", err);
// //       setMessage("❌ Login failed");
// //     }
// //   };

// //   return (
// //     <div style={{ padding: '2rem' }}>
// //       <h2>🔐 Login</h2>
// //       <form onSubmit={handleLogin}>
// //         <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
// //         <br /><br />
// //         <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
// //         <br /><br />
// //         <button type="submit">Login</button>
// //       </form>
// //       {message && <p>{message}</p>}
// //     </div>
// //   );
// // }

// import { useState } from 'react';
// import { apiService } from '../services/apiService';

// export default function Login() {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [message, setMessage] = useState('');

//   const handleChange = (e) => {
//     setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await apiService.request('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form)
//       });
//       setMessage(res.message);
//     } catch (err) {
//       setMessage('❌ Login failed: ' + (err.message || 'Unknown error'));
//     }
//   };

//   return (
//     <div>
//       <h2>🔐 Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//         /><br /><br />
//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           required
//         /><br /><br />
//         <button type="submit">Login</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   );
// }

// src/components/Login.js
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('❌ Login failed: ' + error.message);
      setLoggedIn(false);
    } else {
      setErrorMsg('');
      setLoggedIn(true);
    }
  };

  return (
    <div>
      <h3>🔐 Login</h3>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} /><br />
      <button onClick={handleLogin}>Login</button>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {loggedIn && <p style={{ color: 'green' }}>✅ Logged in successfully!</p>}
    </div>
  );
}

export default Login;

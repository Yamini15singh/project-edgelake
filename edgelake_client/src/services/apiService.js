// const LOCAL_EDGE_BASE = 'http://192.168.29.155:8080/api';
// const CLOUD_API_BASE = 'https://dummy-cloud-api.com/api'; // Temporary fallback

// class ApiService {
//   useLocal = false;

//   setLocalAvailability(available) {
//     this.useLocal = available;
//   }

//   async request(path, options = {}) {
//     const base = this.useLocal ? LOCAL_EDGE_BASE : CLOUD_API_BASE;
//     const res = await fetch(`${base}${path}`, options);
//     if (!res.ok) throw new Error(`Error: ${res.status}`);
//     return res.json();
//   }
// }

// export const apiService = new ApiService();

class ApiService {
  constructor() {
    this.local = false;
  }

  setLocalAvailability(isLocal) {
    this.local = isLocal;
  }

  async request(endpoint, options = {}) {
    const baseUrl = this.local
      ? 'http://192.168.94.232:8080'  // ✅ your Wi-Fi IP here
      : 'https://your-cloud-api.com';

    const response = await fetch(`${baseUrl}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  }
}

export const apiService = new ApiService();

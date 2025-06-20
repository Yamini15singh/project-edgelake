const LOCAL_EDGE_BASE = 'http://192.168.21.170:8080/api';
const CLOUD_API_BASE = 'https://dummy-cloud-api.com/api'; // Temporary fallback

class ApiService {
  useLocal = false;

  setLocalAvailability(available) {
    this.useLocal = available;
  }

  async request(path, options = {}) {
    const base = this.useLocal ? LOCAL_EDGE_BASE : CLOUD_API_BASE;
    const res = await fetch(`${base}${path}`, options);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  }
}

export const apiService = new ApiService();

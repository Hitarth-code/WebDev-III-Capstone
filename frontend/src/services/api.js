const API_BASE = '/api';

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const authAPI = {
  login: (credentials) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (userData) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
  getProfile: () => fetchWithAuth('/auth/profile')
};

export const hotelAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/hotels${query ? `?${query}` : ''}`);
  },
  getById: (id) => fetchWithAuth(`/hotels/${id}`),
  getMyHotels: () => fetchWithAuth('/hotels/manager/my-hotels'),
  create: (hotelData) =>
    fetchWithAuth('/hotels', {
      method: 'POST',
      body: JSON.stringify(hotelData)
    }),
  update: (id, hotelData) =>
    fetchWithAuth(`/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hotelData)
    }),
  delete: (id) =>
    fetchWithAuth(`/hotels/${id}`, {
      method: 'DELETE'
    })
};

export const roomAPI = {
  getByHotel: (hotelId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/rooms/hotel/${hotelId}${query ? `?${query}` : ''}`);
  },
  getById: (id) => fetchWithAuth(`/rooms/${id}`),
  create: (roomData) =>
    fetchWithAuth('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    }),
  update: (id, roomData) =>
    fetchWithAuth(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData)
    }),
  delete: (id) =>
    fetchWithAuth(`/rooms/${id}`, {
      method: 'DELETE'
    })
};

export const bookingAPI = {
  create: (bookingData) =>
    fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    }),
  getMyBookings: () => fetchWithAuth('/bookings/my-bookings'),
  cancel: (id) =>
    fetchWithAuth(`/bookings/${id}/cancel`, {
      method: 'PUT'
    }),
  getAll: () => fetchWithAuth('/bookings/all')
};

export const reportAPI = {
  getDashboard: () => fetchWithAuth('/reports/dashboard')
};

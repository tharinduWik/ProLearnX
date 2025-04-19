import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Successful response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error);

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. The server is taking too long to respond.');
      error.friendlyMessage = 'Request timed out. Please try again later.';
    } else if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);

      if (error.response.status === 503) {
        error.friendlyMessage = 'Database is currently unavailable. Please try again later.';
      } else if (error.response.status === 401) {
        error.friendlyMessage = 'Unauthorized. Please log in again.';
      } else if (error.response.data && typeof error.response.data === 'string') {
        if (error.response.data.includes('MongoDB') || error.response.data.includes('SSLException')) {
          console.error('MongoDB Connection Error Detected');
          error.friendlyMessage = 'Database connection error occurred. Please try again later.';
        } else {
          error.friendlyMessage = error.response.data;
        }
      } else {
        error.friendlyMessage = `Error ${error.response.status}: ${error.message}`;
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      error.friendlyMessage = 'No response from server. Please check your connection.';
    } else {
      console.error('Request error:', error.message);
      error.friendlyMessage = error.message;
    }
    return Promise.reject(error);
  }
);

export const userService = {
  register: (userData) => apiClient.post('/users/register', userData),
  login: (email, password) => apiClient.post(`/users/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`),
  getUser: (userId) => apiClient.get(`/users/${userId}`),
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData)
};

export const postService = {
  createPost: (formData) => {
    console.log("Creating post with form data:", formData);
    // Set longer timeout for file uploads (1 minute)
    return axios.post(`${API_URL}/posts`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000, // 1 minute for file uploads
      onUploadProgress: (progressEvent) => {
        // Optional progress tracking
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
  },
  
  // New method for creating posts with pre-uploaded media URLs
  createPostWithUrls: (postData) => {
    console.log("Creating post with URLs:", postData);
    return apiClient.post('/posts/with-urls', postData);
  },
  
  getAllPosts: () => apiClient.get('/posts'),
  getUserPosts: (userId) => apiClient.get(`/posts/user/${userId}`),
  getPost: (postId) => apiClient.get(`/posts/${postId}`),
  deletePost: (postId) => apiClient.delete(`/posts/${postId}`)
};

export default apiClient;
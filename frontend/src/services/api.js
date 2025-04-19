import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000 // Increase timeout to 120 seconds (2 minutes)
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
    
    // Specific handling for timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. The server is taking too long to respond.');
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      // Log more detailed MongoDB errors if present
      if (typeof error.response.data === 'string' && 
          (error.response.data.includes('MongoDB') || error.response.data.includes('SSLException'))) {
        console.error('MongoDB Connection Error Detected');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
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
    // Set longer timeout for file uploads (3 minutes)
    return axios.post(`${API_URL}/posts`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 180000, // 3 minutes for file uploads
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
    return apiClient.post('/posts/with-urls', JSON.stringify(postData), {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 90000 // 90 seconds specifically for this operation
    });
  },
  
  getAllPosts: () => apiClient.get('/posts'),
  getUserPosts: (userId) => apiClient.get(`/posts/user/${userId}`),
  getPost: (postId) => apiClient.get(`/posts/${postId}`),
  deletePost: (postId) => apiClient.delete(`/posts/${postId}`)
};

export default apiClient;
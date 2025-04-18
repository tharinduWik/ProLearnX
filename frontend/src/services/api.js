import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
    // Set longer timeout for file uploads (60 seconds)
    return axios.post(`${API_URL}/posts`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000,
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
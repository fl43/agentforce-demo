// api.js
import axios from 'axios';

class Api {
  constructor(baseURL) {
    this.axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Method to set the Authorization token (e.g., JWT)
  setAuthToken(token) {
    console.log('Token: ', token);

    if (token) {
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  // Example of a GET request
  async get(endpoint, params = {}) {
    try {
      const response = await this.axiosInstance.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Example of a POST request
  async post(endpoint, data) {
    try {
      const response = await this.axiosInstance.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Example of a PUT request
  async put(endpoint, data) {
    try {
      const response = await this.axiosInstance.put(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Example of a DELETE request
  async delete(endpoint) {
    try {
      const response = await this.axiosInstance.delete(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Centralized error handling
  handleError(error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error('Error Response:', error.response.data);
      throw new Error(error.response.data.message || 'API Error');
    } else if (error.request) {
      // No response from the server
      console.error('Error Request:', error.request);
      throw new Error('Network Error');
    } else {
      // Something went wrong in setting up the request
      console.error('Error Message:', error.message);
      throw new Error('Request Error');
    }
  }
}

// Export a single instance of the class for app-wide use
export const api = new Api('https://d8v000002kyn3uak-dev-ed.develop.my.salesforce-scrt.com');

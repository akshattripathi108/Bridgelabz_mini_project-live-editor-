import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class GitHubAuth {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get repositories
  async getRepositories() {
    try {
      const response = await axios.get(`${API_URL}/github/repositories`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data.repositories || [];
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      throw error;
    }
  }

  // Get GitHub user info
  async getUserInfo() {
    try {
      const response = await axios.get(`${API_URL}/github/user`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data.github;
    } catch (error) {
      console.error('Failed to fetch GitHub user:', error);
      throw error;
    }
  }

  // Push code to GitHub
  async pushToGithub(roomId, repoName, repoOwner, message, branch = 'main') {
    try {
      const response = await axios.post(
        `${API_URL}/github/push`,
        { roomId, repoName, repoOwner, message, branch },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to push to GitHub:', error);
      throw error;
    }
  }

  // Update token when user logs in
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear token on logout
  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
}

export default new GitHubAuth();

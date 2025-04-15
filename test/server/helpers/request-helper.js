const request = require('supertest');

/**
 * Request helper for API tests with token support
 * @param {object} app - Express app instance
 */
function createRequestHelper(app) {
  return {
    /**
     * Make a GET request
     * @param {string} url - URL to request
     * @param {string|null} token - Auth token (optional)
     * @returns {Promise<object>} Response
     */
    get: (url, token = null) => {
      const req = request(app).get(url);
      if (token) {
        req.set('x-auth-token', token);
      }
      return req;
    },

    /**
     * Make a POST request
     * @param {string} url - URL to request
     * @param {object} data - Request body
     * @param {string|null} token - Auth token (optional)
     * @returns {Promise<object>} Response
     */
    post: (url, data, token = null) => {
      const req = request(app).post(url).send(data);
      if (token) {
        req.set('x-auth-token', token);
      }
      return req;
    },

    /**
     * Make a PUT request
     * @param {string} url - URL to request
     * @param {object} data - Request body
     * @param {string|null} token - Auth token (optional)
     * @returns {Promise<object>} Response
     */
    put: (url, data, token = null) => {
      const req = request(app).put(url).send(data);
      if (token) {
        req.set('x-auth-token', token);
      }
      return req;
    },

    /**
     * Make a DELETE request
     * @param {string} url - URL to request
     * @param {string|null} token - Auth token (optional)
     * @returns {Promise<object>} Response
     */
    delete: (url, token = null) => {
      const req = request(app).delete(url);
      if (token) {
        req.set('x-auth-token', token);
      }
      return req;
    }
  };
}

module.exports = {
  createRequestHelper
}; 
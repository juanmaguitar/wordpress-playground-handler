import { describe, it, expect, beforeAll } from 'vitest';
import { getPlaygroundHandler, PHPRequestHandler, PHPRequest } from '../src/lib.js';
import { resolve } from 'path';

describe('WordPress API functionality', () => {
  let handler: PHPRequestHandler;
  let authToken: string;

  beforeAll(async () => {
    handler = await getPlaygroundHandler({
      blueprintPath: './example/wordpress/blueprint.json',
      mountPaths: {
        databasePath: resolve('./example/wordpress/database/'),
        muPluginsPath: resolve('./example/wordpress/mu-plugins/')
      }
    });
  });

  describe('Authentication', () => {
    it('should authenticate and get JWT token', async () => {
      const request: PHPRequest = {
        method: 'POST',
        url: '/wp-json/jwt-auth/v1/token',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          username: 'admin',
          password: 'password',
        },
      };

      const response = await handler.request(request);
      const data = JSON.parse(response.text);

      expect(response.httpStatusCode).toBe(200);
      expect(data.token).toBeDefined();
      expect(data.user_email).toBe('admin@localhost.com');
      expect(data.user_nicename).toBe('admin');

      authToken = data.token;
    });

    it('should fail with wrong credentials', async () => {
      const request: PHPRequest = {
        method: 'POST',
        url: '/wp-json/jwt-auth/v1/token',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          username: 'admin',
          password: 'wrongpassword',
        },
      };

      const response = await handler.request(request);
      
      expect(response.httpStatusCode).toBe(403);
    });
  });

  describe('User API', () => {
    it('should get current user info with valid token', async () => {
      const request: PHPRequest = {
        method: 'GET',
        url: '/wp-json/wp/v2/users/me',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const response = await handler.request(request);
      const data = JSON.parse(response.text);

      expect(response.httpStatusCode).toBe(200);
      expect(data.id).toBe(1);
      expect(data.name).toBe('admin');
      // With mounted mu-plugin, these fields should now be available
      expect(data.email).toBe('admin@localhost.com');
      expect(data.role).toBe('administrator');
      expect(data.capabilities).toBeDefined();
      expect(typeof data.capabilities).toBe('object');
      expect(data.last_login).toBeDefined();
      expect(data.joined).toBeDefined();
    });

    it('should fail without authentication token', async () => {
      const request: PHPRequest = {
        method: 'GET',
        url: '/wp-json/wp/v2/users/me',
      };

      const response = await handler.request(request);
      
      expect(response.httpStatusCode).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const request: PHPRequest = {
        method: 'GET',
        url: '/wp-json/wp/v2/users/me',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      };

      const response = await handler.request(request);
      
      expect(response.httpStatusCode).toBe(403);
    });
  });

  describe('REST API Discovery', () => {
    it('should get REST API index', async () => {
      const response = await handler.request({
        method: 'GET',
        url: '/wp-json/',
      });

      const data = JSON.parse(response.text);

      expect(response.httpStatusCode).toBe(200);
      expect(data.name).toBeDefined();
      expect(data.description).toBeDefined();
      expect(data.url).toBe('http://localhost:8080');
      expect(data.namespaces).toContain('wp/v2');
      expect(data.namespaces).toContain('jwt-auth/v1');
    });
  });

  describe('Posts API', () => {
    it('should retrieve posts', async () => {
      const response = await handler.request({
        method: 'GET',
        url: '/wp-json/wp/v2/posts',
      });

      const posts = JSON.parse(response.text);

      expect(response.httpStatusCode).toBe(200);
      expect(Array.isArray(posts)).toBe(true);
    });

    it('should create a post with authentication', async () => {
      const request: PHPRequest = {
        method: 'POST',
        url: '/wp-json/wp/v2/posts',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: {
          title: 'Test Post',
          content: 'This is a test post content',
          status: 'publish',
        },
      };

      const response = await handler.request(request);
      const post = JSON.parse(response.text);

      expect(response.httpStatusCode).toBe(201);
      expect(post.title.rendered).toBe('Test Post');
      expect(post.content.rendered).toContain('This is a test post content');
      expect(post.status).toBe('publish');
    });
  });

  describe('Mount Paths Functionality', () => {
    it('should have extended user fields from mounted mu-plugin', async () => {
      const request: PHPRequest = {
        method: 'GET',
        url: '/wp-json/wp/v2/users/me',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const response = await handler.request(request);
      const data = JSON.parse(response.text);

      expect(response.httpStatusCode).toBe(200);
      
      // These fields should be available because of the mounted mu-plugin
      expect(data.email).toBe('admin@localhost.com');
      expect(data.role).toBe('administrator');
      expect(data.capabilities).toBeDefined();
      expect(typeof data.capabilities).toBe('object');
      expect(data.joined).toBeDefined();
      expect(data.last_login).toBeDefined();
    });

    it('should access database files from mounted path', async () => {
      // Test that the database is accessible by making a query that would fail without proper mounting
      const request: PHPRequest = {
        method: 'POST',
        url: '/wp-json/wp/v2/posts',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: {
          title: 'Database Mount Test',
          content: 'Testing database mount functionality',
          status: 'publish',
        },
      };

      const response = await handler.request(request);
      const post = JSON.parse(response.text);

      expect(response.httpStatusCode).toBe(201);
      expect(post.title.rendered).toBe('Database Mount Test');
      
      // Verify the post was actually saved by retrieving it
      const getRequest: PHPRequest = {
        method: 'GET',
        url: `/wp-json/wp/v2/posts/${post.id}`,
      };

      const getResponse = await handler.request(getRequest);
      const retrievedPost = JSON.parse(getResponse.text);

      expect(getResponse.httpStatusCode).toBe(200);
      expect(retrievedPost.title.rendered).toBe('Database Mount Test');
    });

    it('should have mu-plugins loaded from mounted path', async () => {
      // Test that mu-plugins are loaded by checking if the extended-user-info-rest plugin endpoints work
      const response = await handler.request({
        method: 'GET',
        url: '/wp-json/',
      });

      const apiIndex = JSON.parse(response.text);
      
      expect(response.httpStatusCode).toBe(200);
      // The API should work normally, indicating mu-plugins are loaded
      expect(apiIndex.namespaces).toContain('wp/v2');
      
      // Test the extended user info functionality added by the mu-plugin
      const userRequest: PHPRequest = {
        method: 'GET',
        url: '/wp-json/wp/v2/users/me',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const userResponse = await handler.request(userRequest);
      const userData = JSON.parse(userResponse.text);

      expect(userResponse.httpStatusCode).toBe(200);
      // These are the custom fields added by the mounted mu-plugin
      expect(userData).toHaveProperty('email');
      expect(userData).toHaveProperty('role');
      expect(userData).toHaveProperty('capabilities');
      expect(userData).toHaveProperty('joined');
      expect(userData).toHaveProperty('last_login');
    });
  });
});
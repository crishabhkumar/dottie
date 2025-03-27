import { test, expect } from '@playwright/test';
import { setupUser } from './api-user-setup';

/**
 * Test for PUT /api/auth/users/:id endpoint
 */
test.describe('User API - Update User', () => {
  let authToken = null;
  let userId = null;
  
  // Setup - create user and get auth token
  test.beforeAll(async ({ request }) => {
    const setup = await setupUser(request);
    authToken = setup.authToken;
    userId = setup.userId;
  });
  
  test('PUT /api/auth/users/:id - should update user', async ({ request }) => {
    // Skip this test if no auth token or user ID is available
    test.skip(!authToken || !userId, 'No auth token or user ID available');
    
    // Updated user data
    const updatedData = {
      username: `updated-${Date.now()}`
    };
    
    // Update user
    const response = await request.put(`/api/auth/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: updatedData
    });
    
    // Verify successful update
    expect(response.status()).toBe(200);
    
    // Verify response contains updated user data
    const data = await response.json();
    expect(data).toHaveProperty('id', userId);
    expect(data).toHaveProperty('username', updatedData.username);
  });
}); 
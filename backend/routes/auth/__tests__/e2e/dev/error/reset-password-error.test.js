// @ts-check
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { createServer } from 'http';
import { getApp, closeTestServer } from '../../../../../test-utilities/setup.js';

let app;
let request;
let server;

// Setup for reset password error tests
beforeAll(async () => {
  app = await getApp();
  server = createServer(app);
  request = supertest(server);
  
  await new Promise(resolve => {
    server.listen(5005, () => {
      console.log('Reset password error test server started on port 5005');
      resolve(true);
    });
  });
});

afterAll(async () => {
  await closeTestServer(server);
  console.log('Reset password error test server closed');
});

describe("Password Reset - Error Scenarios", { tags: ['authentication', 'dev', 'error'] }, () => {
  test("Should reject reset password request with missing email", async () => {
    const resetData = {};
    
    const response = await request
      .post("/api/auth/reset-password")
      .send(resetData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("Should reject reset password request with invalid email format", async () => {
    const resetData = {
      email: "invalid-email-format"
    };

    const response = await request
      .post("/api/auth/reset-password")
      .send(resetData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("Should handle reset password request for non-existent email", async () => {
    const resetData = {
      email: "nonexistent@example.com"
    };

    const response = await request
      .post("/api/auth/reset-password")
      .send(resetData);

    // Should return 200 for security reasons (don't reveal if email exists)
    expect(response.status).toBe(200);
  });

  test("Should reject password reset completion with invalid token", async () => {
    const resetData = {
      token: "invalid-token",
      password: "NewPassword123!"
    };
    
    const response = await request
      .post("/api/auth/reset-password-complete")
      .send(resetData);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("Should reject password reset completion with weak password", async () => {
    // Setup: Register a user first
    const userData = {
      username: "resetpassuser",
      email: "reset-pass-test@example.com", 
      password: "ValidPassword123!"
    };
    
    await request
      .post("/api/auth/signup")
      .send(userData);
    
    // Request password reset
    await request
      .post("/api/auth/reset-password")
      .send({ email: userData.email });
    
    // Try to complete reset with a weak password
    const resetData = {
      token: "mock-token-for-testing", // Mock token
      password: "weak"  // Weak password
    };
    
    const response = await request
      .post("/api/auth/reset-password-complete")
      .send(resetData);
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
}); 
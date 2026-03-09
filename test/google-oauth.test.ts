import { describe, it, expect } from 'vitest';

describe('Google OAuth Configuration', () => {
  it('should have VITE_GOOGLE_CLIENT_ID environment variable set', () => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId).toBeTruthy();
  });

  it('should have valid Google Client ID format', () => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    // Google Client ID format: {project-number}-{random-string}.apps.googleusercontent.com
    expect(clientId).toMatch(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
  });

  it('should contain correct project number', () => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    expect(clientId).toContain('714942041836');
  });

  it('should be usable for Google Sign-In', () => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    // Verify it's not empty and has the correct structure
    expect(clientId?.length).toBeGreaterThan(20);
    expect(clientId).toContain('apps.googleusercontent.com');
  });
});

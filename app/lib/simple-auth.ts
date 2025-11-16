// Simple localStorage-based authentication
// Just for V1 Beta - stores email/password in browser

const USERS_KEY = 'resova_users';
const CURRENT_USER_KEY = 'resova_current_user';

export interface User {
  email: string;
  password: string; // In production, this would be hashed server-side
}

export const SimpleAuth = {
  // Sign up new user
  signup(email: string, password: string): void {
    // V1 Beta: Require @clubspeed.com email
    if (!email.toLowerCase().endsWith('@clubspeed.com')) {
      throw new Error('V1 Beta is restricted to @clubspeed.com email addresses');
    }

    const users = this.getAllUsers();

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    // Clear ALL old data before signup
    localStorage.clear();

    // Add new user
    const newUsers = [{ email: email.toLowerCase(), password }];
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));

    // Auto sign in
    localStorage.setItem(CURRENT_USER_KEY, email.toLowerCase());
  },

  // Sign in existing user
  signin(email: string, password: string): void {
    const users = this.getAllUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    localStorage.setItem(CURRENT_USER_KEY, email.toLowerCase());
  },

  // Sign out current user
  signout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Check if user is signed in
  isSignedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(CURRENT_USER_KEY);
  },

  // Get current user email
  getCurrentUser(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CURRENT_USER_KEY);
  },

  // Get all users (internal)
  getAllUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }
};

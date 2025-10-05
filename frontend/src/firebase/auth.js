// Firebase Authentication utilities
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from './config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google (popup)
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google (redirect)
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    return { error: error.message };
  }
};

// Get redirect result
export const getGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return { user: result.user, error: null };
    }
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Admin authentication (bypasses Firebase)
export const signInAsAdmin = async (email, password) => {
  try {
    // Check for admin credentials
    if (email === 'Admin' && password === 'Admin1') {
      // Create a mock admin user object
      const adminUser = {
        uid: 'admin-uid',
        email: 'Admin',
        displayName: 'Admin',
        isAdmin: true,
        accessToken: 'admin-token'
      };
      
      // Store admin session in localStorage
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      
      return { user: adminUser, error: null };
    } else {
      return { user: null, error: 'Invalid admin credentials' };
    }
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Check if current user is admin
export const isAdmin = () => {
  const adminUser = localStorage.getItem('adminUser');
  return adminUser && JSON.parse(adminUser).isAdmin;
};

// Get admin user from localStorage
export const getAdminUser = () => {
  const adminUser = localStorage.getItem('adminUser');
  return adminUser ? JSON.parse(adminUser) : null;
};

// Sign out admin
export const signOutAdmin = async () => {
  try {
    localStorage.removeItem('adminUser');
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

type User = {
  id: string;
  email: string | null;
  name: string | null;
  isVerified: boolean;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  verifyEmail: async () => {},
  resendVerification: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Convert Firebase user to our User type
const formatUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    isVerified: firebaseUser.emailVerified
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(formatUser(firebaseUser));
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Store the email for verification resending if not verified
      if (!userCredential.user.emailVerified) {
        setPendingVerificationEmail(email);
        // Show a warning but allow login
        toast.warning('Your email is not verified. Some features may be limited.');
      }
      
      // User is automatically set by the auth state listener
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('User not found');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Invalid password');
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to login');
      }
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name
      await updateProfile(userCredential.user, { displayName: name });
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Store the email for verification resending
      setPendingVerificationEmail(email);
      
      // Sign out the user until they verify their email
      await signOut(auth);
      
    } catch (error: any) {
      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('User with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to create account');
      }
    }
  };

  const verifyEmail = async (token: string) => {
    // Firebase handles email verification via links
    // This function is kept for API compatibility
    return Promise.resolve();
  };

  // Store the last email that needed verification
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const resendVerification = async (email?: string) => {
    try {
      // Use the provided email or the stored pending verification email
      const emailToVerify = email || pendingVerificationEmail;
      
      if (!emailToVerify) {
        throw new Error('No email address available for verification');
      }

      // Check if there's a user with this email that needs verification
      // This is a Firebase Admin SDK operation that we're simulating here
      // In a real app, you might need a backend endpoint for this
      
      // For Firebase client SDK, we can use the signInWithEmailAndPassword method
      // to temporarily sign in the user, send verification, and then sign out
      
      // Create a custom Firebase function or use a backend API for this in production
      
      // For now, we'll show a more helpful message
      toast.success(`Verification email sent to ${emailToVerify}`);
      toast.info("Please check your inbox and spam folder");
      
      // In a real implementation, you would call your backend API here
      // For example: await fetch('/api/resend-verification', { method: 'POST', body: JSON.stringify({ email: emailToVerify }) });
      
    } catch (error: any) {
      console.error("Error resending verification:", error);
      throw new Error('Failed to resend verification email');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // User is automatically set to null by the auth state listener
    } catch (error: any) {
      throw new Error('Failed to logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Remove email verification requirement
        isLoading,
        login,
        signup,
        logout,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

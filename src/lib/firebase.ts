// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// Replace these placeholder values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCaZ_jcuCAuoDYGLW0qVbfZZdzlwMasLqY",
  authDomain: "sike-rentals.firebaseapp.com",
  projectId: "sike-rentals",
  storageBucket: "sike-rentals.firebasestorage.app",
  messagingSenderId: "719709432653",
  appId: "1:719709432653:web:f0e0d209ab2216c4fbe504"
  // measurementId is optional and only needed if you've enabled Google Analytics
  // measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Request permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY_HERE' // Replace with your VAPID key from Firebase console
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Handle foreground messages
export const onMessageListener = () => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    // You can handle the message here, e.g., show a toast notification
  });
};

export default app;
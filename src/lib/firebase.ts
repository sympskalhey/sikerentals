// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaZ_jcuCAuoDYGLW0qVbfZZdzlwMasLqY",
  authDomain: "sike-rentals.firebaseapp.com",
  projectId: "sike-rentals",
  storageBucket: "sike-rentals.firebasestorage.app",
  messagingSenderId: "719709432653",
  appId: "1:719709432653:web:f0e0d209ab2216c4fbe504"
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
      // Get service worker registration
      const swRegistration = await navigator.serviceWorker.getRegistration();
      
      // Your VAPID public key from Firebase console
      const vapidPublicKey = 'BLECjEXLaHzExLJ0s_i0WEZ-DM3w2AN89leqTt3tJ0jsBtgHrAgy4oK9yPbU0F2Hy1Iu1MjrfaXmdMYGiy-qxls';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Subscribe to push
      await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: vapidPublicKey // Use the same VAPID key here
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
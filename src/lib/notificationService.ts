import { toast } from 'sonner';
import { Rental } from '@/types/garage';
import { requestNotificationPermission, messaging } from './firebase';
import { getToken } from 'firebase/messaging';
import { addDocument, updateDocument, getDocument, subscribeToCollection } from './firestore';

// Interface for notification records
interface NotificationRecord {
  id?: string;
  rentalId: string;
  userId: string;
  type: 'pre_end' | 'ended';
  sent: boolean;
  sentAt?: string;
  fcmToken?: string;
}

// Store for FCM tokens
let fcmToken: string | null = null;

// Store for notification records to avoid duplicates
const sentNotifications = new Set<string>();

/**
 * Initialize the notification service
 */
export const initNotificationService = async (): Promise<void> => {
  try {
    // Request notification permission and get FCM token
    fcmToken = await requestNotificationPermission();
    
    if (fcmToken) {
      console.log('Notification service initialized with token:', fcmToken);
      
      // Subscribe to notifications collection to track sent notifications
      subscribeToNotifications();
      
      // Start checking for rental end times
      startRentalEndTimeChecker();
    } else {
      console.warn('Notification permission denied or FCM token not available');
    }
  } catch (error) {
    console.error('Error initializing notification service:', error);
  }
};

/**
 * Subscribe to notifications collection
 */
const subscribeToNotifications = () => {
  subscribeToCollection<NotificationRecord>('notifications', (notifications) => {
    // Update the set of sent notifications
    notifications.forEach(notification => {
      if (notification.sent) {
        sentNotifications.add(`${notification.rentalId}_${notification.type}`);
      }
    });
  });
};

/**
 * Start checking for rental end times
 */
const startRentalEndTimeChecker = () => {
  // Check every minute
  const interval = setInterval(checkRentalEndTimes, 60000);
  
  // Initial check
  checkRentalEndTimes();
  
  // Return cleanup function
  return () => clearInterval(interval);
};

/**
 * Check rental end times and send notifications if needed
 */
const checkRentalEndTimes = async () => {
  try {
    // Get all active rentals
    const rentals = await getRentals();
    const activeRentals = rentals.filter(rental => rental.status === 'active');
    
    // Current time
    const now = new Date().getTime();
    
    // Check each active rental
    for (const rental of activeRentals) {
      const endTime = new Date(rental.endTime).getTime();
      const timeRemaining = endTime - now;
      
      // 30 minutes in milliseconds
      const thirtyMinutes = 30 * 60 * 1000;
      
      // Check if rental is ending in 30 minutes
      if (timeRemaining > 0 && timeRemaining <= thirtyMinutes) {
        // Check if notification has already been sent
        const notificationKey = `${rental.id}_pre_end`;
        if (!sentNotifications.has(notificationKey)) {
          // Send notification
          await sendRentalEndingSoonNotification(rental);
          
          // Mark notification as sent
          await recordNotification(rental.id, 'pre_end');
          sentNotifications.add(notificationKey);
        }
      }
      
      // Check if rental has ended
      if (timeRemaining <= 0) {
        // Check if notification has already been sent
        const notificationKey = `${rental.id}_ended`;
        if (!sentNotifications.has(notificationKey)) {
          // Send notification
          await sendRentalEndedNotification(rental);
          
          // Mark notification as sent
          await recordNotification(rental.id, 'ended');
          sentNotifications.add(notificationKey);
        }
      }
    }
  } catch (error) {
    console.error('Error checking rental end times:', error);
  }
};

/**
 * Get all rentals
 */
const getRentals = async (): Promise<Rental[]> => {
  try {
    // This is a placeholder - in a real implementation, you would use the firestore service
    // to get all rentals. For now, we'll just return an empty array.
    return [];
  } catch (error) {
    console.error('Error getting rentals:', error);
    return [];
  }
};

/**
 * Send notification for rental ending soon
 */
const sendRentalEndingSoonNotification = async (rental: Rental): Promise<void> => {
  try {
    if (!fcmToken) {
      console.warn('FCM token not available');
      return;
    }
    
    // Get vehicle details
    const vehicleDetails = await getVehicleDetails(rental.vehicleId);
    
    // Create notification title and body
    const title = 'Rental Ending Soon';
    const body = `Your rental for ${vehicleDetails} will end in 30 minutes.`;
    
    // Send notification
    await sendNotification(title, body, fcmToken);
    
    // Also show a toast notification
    toast.info(body, { duration: 5000 });
    
    console.log('Sent rental ending soon notification for rental:', rental.id);
  } catch (error) {
    console.error('Error sending rental ending soon notification:', error);
  }
};

/**
 * Send notification for rental ended
 */
const sendRentalEndedNotification = async (rental: Rental): Promise<void> => {
  try {
    if (!fcmToken) {
      console.warn('FCM token not available');
      return;
    }
    
    // Get vehicle details
    const vehicleDetails = await getVehicleDetails(rental.vehicleId);
    
    // Create notification title and body
    const title = 'Rental Ended';
    const body = `Your rental for ${vehicleDetails} has ended. Please return the vehicle.`;
    
    // Send notification
    await sendNotification(title, body, fcmToken);
    
    // Also show a toast notification
    toast.warning(body, { duration: 5000 });
    
    console.log('Sent rental ended notification for rental:', rental.id);
  } catch (error) {
    console.error('Error sending rental ended notification:', error);
  }
};

/**
 * Get vehicle details
 */
const getVehicleDetails = async (vehicleId: string): Promise<string> => {
  try {
    // This is a placeholder - in a real implementation, you would use the firestore service
    // to get the vehicle details. For now, we'll just return a generic string.
    return 'your vehicle';
  } catch (error) {
    console.error('Error getting vehicle details:', error);
    return 'your vehicle';
  }
};

/**
 * Send a notification using FCM
 */
const sendNotification = async (title: string, body: string, token: string): Promise<void> => {
  try {
    // In a real implementation, you would use Firebase Cloud Functions or a backend service
    // to send the notification. For now, we'll just log it.
    console.log('Sending notification:', { title, body, token });
    
    // Show a browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Record a notification as sent
 */
const recordNotification = async (rentalId: string, type: 'pre_end' | 'ended'): Promise<void> => {
  try {
    if (!fcmToken) {
      console.warn('FCM token not available');
      return;
    }
    
    // Get current user ID
    const userId = 'current_user_id'; // This should be replaced with the actual user ID
    
    // Create notification record
    const notificationRecord: NotificationRecord = {
      rentalId,
      userId,
      type,
      sent: true,
      sentAt: new Date().toISOString(),
      fcmToken
    };
    
    // Add notification record to Firestore
    await addDocument<NotificationRecord>('notifications', notificationRecord);
    
    console.log('Recorded notification:', notificationRecord);
  } catch (error) {
    console.error('Error recording notification:', error);
  }
};

/**
 * Update FCM token
 */
export const updateFcmToken = async (): Promise<void> => {
  try {
    if (!messaging) {
      console.warn('Messaging not available');
      return;
    }
    
    // Get new token
    const newToken = await getToken(messaging);
    
    if (newToken !== fcmToken) {
      fcmToken = newToken;
      console.log('FCM token updated:', newToken);
      
      // Update token in Firestore
      // This is a placeholder - in a real implementation, you would update the token
      // for the current user in Firestore.
    }
  } catch (error) {
    console.error('Error updating FCM token:', error);
  }
};
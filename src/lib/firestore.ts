import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, Firestore } from 'firebase/firestore';
import app from './firebase';
import { Vehicle, Customer, Insurance, Registration, Maintenance, AnnualFee, Incident, Rental } from '@/types/garage';
import { getAuth } from 'firebase/auth';
import { toast } from 'sonner';

// Initialize Firestore
export const db = getFirestore(app);

/**
 * Utility function to clean data for Firestore
 * Firestore doesn't accept undefined values, so we need to:
 * 1. Replace undefined values with null
 * 2. Remove undefined values from objects
 * 3. Process nested objects and arrays
 */
export const cleanDataForFirestore = (data: any): any => {
  // If data is null or undefined, return null (Firestore accepts null)
  if (data === undefined || data === null) {
    return null;
  }
  
  // If data is a primitive value (not an object), return it as is
  if (typeof data !== 'object') {
    return data;
  }
  
  // If data is an array, clean each item
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForFirestore(item));
  }
  
  // If data is an object, clean each property
  const cleanedData: Record<string, any> = {};
  
  for (const key in data) {
    // Skip undefined values
    if (data[key] === undefined) {
      continue;
    }
    
    // Clean the value (handles nested objects and arrays)
    cleanedData[key] = cleanDataForFirestore(data[key]);
  }
  
  return cleanedData;
};

// Check if Firestore is properly initialized
export const checkFirestoreConnection = async (): Promise<boolean> => {
  try {
    console.log('Checking Firestore connection...');
    // Try to access Firestore
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('Firestore connection successful');
    return true;
  } catch (error: any) {
    console.error('Firestore connection error:', error);
    // Show a toast with the error message
    toast.error(`Firestore connection error: ${error.message || 'Unknown error'}`);
    return false;
  }
};

// Helper function to get the current user ID
export const getCurrentUserId = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  console.log('Auth state:', {
    currentUser: user ? {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      isAnonymous: user.isAnonymous,
      providerData: user.providerData
    } : null,
    isSignedIn: !!user
  });
  
  if (!user) {
    console.warn('No user is currently signed in');
    return null;
  }
  
  console.log('Current user ID:', user.uid);
  return user.uid;
};

// Generic function to add a document to a collection
export const addDocument = async <T extends { id?: string }>(
  collectionName: string, 
  data: T
): Promise<T> => {
  try {
    console.log(`Adding document to ${collectionName}:`, data);
    
    // Check if Firestore is connected
    const isConnected = await checkFirestoreConnection();
    if (!isConnected) {
      throw new Error('Firestore is not connected');
    }
    
    // Still require authentication, but don't use user-specific collections
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated');
      toast.error('You must be signed in to add data');
      throw new Error('User not authenticated');
    }

    // Create a reference to the shared collection (accessible to all authenticated users)
    const sharedCollectionRef = collection(db, collectionName);
    
    // If the document has an ID, use it, otherwise let Firestore generate one
    const docRef = data.id ? doc(sharedCollectionRef, data.id) : doc(sharedCollectionRef);
    
    // If the document doesn't have an ID, add the generated one
    const docData = { ...data, id: data.id || docRef.id };
    
    // Clean the data for Firestore (remove undefined values)
    const cleanedData = cleanDataForFirestore(docData);
    
    console.log(`Cleaned data for Firestore:`, cleanedData);
    
    // Add the document to Firestore
    await setDoc(docRef, cleanedData);
    
    console.log(`Document added successfully to ${collectionName}:`, cleanedData);
    toast.success(`Added successfully`);
    
    return docData as T;
  } catch (error: any) {
    console.error(`Error adding document to ${collectionName}:`, error);
    
    // Handle specific Firestore errors
    let errorMessage = 'Failed to add data';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Check Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore service is unavailable. Check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Firestore collection not found. Make sure Firestore is enabled in your Firebase project.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Generic function to update a document in a collection
export const updateDocument = async <T>(
  collectionName: string, 
  id: string, 
  data: Partial<T>
): Promise<void> => {
  try {
    console.log(`Updating document in ${collectionName} with ID ${id}:`, data);
    
    // Still require authentication, but don't use user-specific collections
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated');
      toast.error('You must be signed in to update data');
      throw new Error('User not authenticated');
    }

    // Clean the data for Firestore (remove undefined values)
    const cleanedData = cleanDataForFirestore(data);
    
    console.log(`Cleaned data for Firestore:`, cleanedData);

    // Use shared collection path
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, cleanedData as any);
    
    console.log(`Document updated successfully in ${collectionName} with ID ${id}`);
    toast.success('Updated successfully');
  } catch (error: any) {
    console.error(`Error updating document in ${collectionName} with ID ${id}:`, error);
    
    // Handle specific Firestore errors
    let errorMessage = 'Failed to update data';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Check Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore service is unavailable. Check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Document not found. It may have been deleted.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Generic function to delete a document from a collection
export const deleteDocument = async (
  collectionName: string, 
  id: string
): Promise<void> => {
  try {
    console.log(`Deleting document from ${collectionName} with ID ${id}`);
    
    // Still require authentication, but don't use user-specific collections
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated');
      toast.error('You must be signed in to delete data');
      throw new Error('User not authenticated');
    }

    // Use shared collection path
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    
    console.log(`Document deleted successfully from ${collectionName} with ID ${id}`);
    toast.success('Deleted successfully');
  } catch (error: any) {
    console.error(`Error deleting document from ${collectionName} with ID ${id}:`, error);
    
    // Handle specific Firestore errors
    let errorMessage = 'Failed to delete data';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Check Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore service is unavailable. Check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Document not found. It may have been deleted already.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Generic function to get a document from a collection
export const getDocument = async <T>(
  collectionName: string, 
  id: string
): Promise<T | null> => {
  try {
    console.log(`Getting document from ${collectionName} with ID ${id}`);
    
    // Still require authentication, but don't use user-specific collections
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated');
      toast.error('You must be signed in to access data');
      throw new Error('User not authenticated');
    }

    // Use shared collection path
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`Document found in ${collectionName} with ID ${id}:`, docSnap.data());
      return docSnap.data() as T;
    } else {
      console.log(`Document not found in ${collectionName} with ID ${id}`);
      return null;
    }
  } catch (error: any) {
    console.error(`Error getting document from ${collectionName} with ID ${id}:`, error);
    
    // Handle specific Firestore errors
    let errorMessage = 'Failed to get data';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Check Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore service is unavailable. Check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Generic function to get all documents from a collection
export const getDocuments = async <T>(
  collectionName: string
): Promise<T[]> => {
  try {
    console.log(`Getting all documents from ${collectionName}`);
    
    // Still require authentication, but don't use user-specific collections
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated');
      toast.error('You must be signed in to access data');
      throw new Error('User not authenticated');
    }

    // Use shared collection path
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    
    const documents = querySnapshot.docs.map(doc => doc.data() as T);
    console.log(`Found ${documents.length} documents in ${collectionName}:`, documents);
    
    return documents;
  } catch (error: any) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    
    // Handle specific Firestore errors
    let errorMessage = 'Failed to get data';
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permission denied. Check Firestore security rules.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firestore service is unavailable. Check your internet connection.';
    } else if (error.code === 'not-found') {
      errorMessage = 'Collection not found. Make sure Firestore is enabled in your Firebase project.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Generic function to listen for changes in a collection
export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void
) => {
  try {
    console.log(`Setting up subscription to ${collectionName}`);
    
    // Still require authentication, but don't use user-specific collections
    const userId = getCurrentUserId();
    console.log(`User ID for ${collectionName} subscription:`, userId);
    
    if (!userId) {
      console.error(`User not authenticated for ${collectionName} subscription`);
      callback([]);
      return () => {};
    }

    // Use shared collection path
    const collectionPath = collectionName;
    console.log(`Collection path for ${collectionName}:`, collectionPath);
    
    const collectionRef = collection(db, collectionPath);
    
    return onSnapshot(
      collectionRef, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const docData = doc.data() as T;
          return docData;
        });
        
        console.log(`Received update from ${collectionName}:`, {
          collectionPath,
          documentCount: data.length,
          documents: data
        });
        
        callback(data);
      },
      (error) => {
        console.error(`Error in subscription to ${collectionName}:`, {
          collectionPath,
          error
        });
        
        // Handle specific Firestore errors
        let errorMessage = 'Failed to subscribe to data updates';
        
        if (error.code === 'permission-denied') {
          errorMessage = 'Permission denied. Check Firestore security rules.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Firestore service is unavailable. Check your internet connection.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      }
    );
  } catch (error: any) {
    console.error(`Error setting up subscription to ${collectionName}:`, error);
    callback([]);
    return () => {};
  }
};

// Specific functions for each collection
export const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => 
  addDocument<Vehicle>('vehicles', vehicle as Vehicle);

export const updateVehicle = (id: string, updates: Partial<Vehicle>) => 
  updateDocument<Vehicle>('vehicles', id, updates);

export const deleteVehicle = (id: string) => 
  deleteDocument('vehicles', id);

export const getVehicle = (id: string) => 
  getDocument<Vehicle>('vehicles', id);

export const getVehicles = () => 
  getDocuments<Vehicle>('vehicles');

export const subscribeToVehicles = (callback: (vehicles: Vehicle[]) => void) => 
  subscribeToCollection<Vehicle>('vehicles', callback);

export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
  const newCustomer: Customer = { 
    ...customer as any, 
    createdAt: new Date().toISOString(),
    rentalHistory: [] 
  };
  return addDocument<Customer>('customers', newCustomer);
};

export const updateCustomer = (id: string, updates: Partial<Customer>) => 
  updateDocument<Customer>('customers', id, updates);

export const deleteCustomer = (id: string) => 
  deleteDocument('customers', id);

export const getCustomer = (id: string) => 
  getDocument<Customer>('customers', id);

export const getCustomers = () => 
  getDocuments<Customer>('customers');

export const subscribeToCustomers = (callback: (customers: Customer[]) => void) => 
  subscribeToCollection<Customer>('customers', callback);

export const addInsurance = (insurance: Omit<Insurance, 'id'>) => 
  addDocument<Insurance>('insurances', insurance as Insurance);

export const updateInsurance = (id: string, updates: Partial<Insurance>) => 
  updateDocument<Insurance>('insurances', id, updates);

export const deleteInsurance = (id: string) => 
  deleteDocument('insurances', id);

export const getInsurance = (id: string) => 
  getDocument<Insurance>('insurances', id);

export const getInsurances = () => 
  getDocuments<Insurance>('insurances');

export const subscribeToInsurances = (callback: (insurances: Insurance[]) => void) => 
  subscribeToCollection<Insurance>('insurances', callback);

export const addRegistration = (registration: Omit<Registration, 'id'>) => 
  addDocument<Registration>('registrations', registration as Registration);

export const updateRegistration = (id: string, updates: Partial<Registration>) => 
  updateDocument<Registration>('registrations', id, updates);

export const deleteRegistration = (id: string) => 
  deleteDocument('registrations', id);

export const getRegistration = (id: string) => 
  getDocument<Registration>('registrations', id);

export const getRegistrations = () => 
  getDocuments<Registration>('registrations');

export const subscribeToRegistrations = (callback: (registrations: Registration[]) => void) => 
  subscribeToCollection<Registration>('registrations', callback);

export const addMaintenance = (maintenance: Omit<Maintenance, 'id'>) => 
  addDocument<Maintenance>('maintenances', maintenance as Maintenance);

export const updateMaintenance = (id: string, updates: Partial<Maintenance>) => 
  updateDocument<Maintenance>('maintenances', id, updates);

export const deleteMaintenance = (id: string) => 
  deleteDocument('maintenances', id);

export const getMaintenance = (id: string) => 
  getDocument<Maintenance>('maintenances', id);

export const getMaintenances = () => 
  getDocuments<Maintenance>('maintenances');

export const subscribeToMaintenances = (callback: (maintenances: Maintenance[]) => void) => 
  subscribeToCollection<Maintenance>('maintenances', callback);

export const addAnnualFee = (fee: Omit<AnnualFee, 'id'>) => 
  addDocument<AnnualFee>('annualFees', fee as AnnualFee);

export const updateAnnualFee = (id: string, updates: Partial<AnnualFee>) => 
  updateDocument<AnnualFee>('annualFees', id, updates);

export const deleteAnnualFee = (id: string) => 
  deleteDocument('annualFees', id);

export const getAnnualFee = (id: string) => 
  getDocument<AnnualFee>('annualFees', id);

export const getAnnualFees = () => 
  getDocuments<AnnualFee>('annualFees');

export const subscribeToAnnualFees = (callback: (fees: AnnualFee[]) => void) => 
  subscribeToCollection<AnnualFee>('annualFees', callback);

export const addIncident = (incident: Omit<Incident, 'id'>) => 
  addDocument<Incident>('incidents', incident as Incident);

export const updateIncident = (id: string, updates: Partial<Incident>) => 
  updateDocument<Incident>('incidents', id, updates);

export const deleteIncident = (id: string) => 
  deleteDocument('incidents', id);

export const getIncident = (id: string) => 
  getDocument<Incident>('incidents', id);

export const getIncidents = () => 
  getDocuments<Incident>('incidents');

export const subscribeToIncidents = (callback: (incidents: Incident[]) => void) => 
  subscribeToCollection<Incident>('incidents', callback);

export const addRental = (rental: Omit<Rental, 'id'>) => 
  addDocument<Rental>('rentals', rental as Rental);

export const updateRental = (id: string, updates: Partial<Rental>) => 
  updateDocument<Rental>('rentals', id, updates);

export const deleteRental = (id: string) => 
  deleteDocument('rentals', id);

export const getRental = (id: string) => 
  getDocument<Rental>('rentals', id);

export const getRentals = () => 
  getDocuments<Rental>('rentals');

export const subscribeToRentals = (callback: (rentals: Rental[]) => void) => 
  subscribeToCollection<Rental>('rentals', callback);
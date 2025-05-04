import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Vehicle, Customer, Insurance, Registration, Maintenance, AnnualFee, Incident, Rental } from '@/types/garage';
import * as firestoreService from '@/lib/firestore';
import { initNotificationService } from '@/lib/notificationService';

interface GarageContextValue {
  vehicles: Vehicle[];
  customers: Customer[];
  insurances: Insurance[];
  registrations: Registration[];
  maintenances: Maintenance[];
  annualFees: AnnualFee[];
  incidents: Incident[];
  rentals: Rental[];
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  refreshSubscriptions: () => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  addInsurance: (insurance: Omit<Insurance, 'id'>) => void;
  updateInsurance: (id: string, updates: Partial<Insurance>) => void;
  deleteInsurance: (id: string) => void;
  addRegistration: (registration: Omit<Registration, 'id'>) => void;
  updateRegistration: (id: string, updates: Partial<Registration>) => void;
  deleteRegistration: (id: string) => void;
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  updateMaintenance: (id: string, updates: Partial<Maintenance>) => void;
  deleteMaintenance: (id: string) => void;
  addAnnualFee: (fee: Omit<AnnualFee, 'id'>) => void;
  updateAnnualFee: (id: string, updates: Partial<AnnualFee>) => void;
  deleteAnnualFee: (id: string) => void;
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  rentVehicle: (vehicleId: string, rental: Omit<Rental, 'id' | 'vehicleId' | 'status'>) => void;
  completeRental: (rentalId: string) => void;
  cancelRental: (rentalId: string) => void;
  extendRental: (rentalId: string, extension: { endTime: string, additionalFee: number }) => void;
  getRentalTimeRemaining: (rentalId: string) => number;
  getRentalById: (rentalId: string) => Rental | undefined;
  getRentalsByCustomerId: (customerId: string) => Rental[];
}

const GarageContext = createContext<GarageContextValue | undefined>(undefined);

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
};

export const GarageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with empty arrays
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [annualFees, setAnnualFees] = useState<AnnualFee[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [notificationInitialized, setNotificationInitialized] = useState(false);
  
  // Initialize notification service once rentals are loaded
  useEffect(() => {
    if (rentals.length > 0 && !notificationInitialized) {
      // Initialize notification service
      initNotificationService();
      setNotificationInitialized(true);
    }
  }, [rentals, notificationInitialized]);
  
  // Function to set up all subscriptions
  const setupSubscriptions = () => {
    console.log('Setting up all Firestore subscriptions');
    
    // Subscribe to vehicles collection
    const unsubscribeVehicles = firestoreService.subscribeToVehicles(setVehicles);
    
    // Subscribe to customers collection
    const unsubscribeCustomers = firestoreService.subscribeToCustomers(setCustomers);
    
    // Subscribe to insurances collection
    const unsubscribeInsurances = firestoreService.subscribeToInsurances(setInsurances);
    
    // Subscribe to registrations collection
    const unsubscribeRegistrations = firestoreService.subscribeToRegistrations(setRegistrations);
    
    // Subscribe to maintenances collection
    const unsubscribeMaintenances = firestoreService.subscribeToMaintenances(setMaintenances);
    
    // Subscribe to annualFees collection
    const unsubscribeAnnualFees = firestoreService.subscribeToAnnualFees(setAnnualFees);
    
    // Subscribe to incidents collection
    const unsubscribeIncidents = firestoreService.subscribeToIncidents(setIncidents);
    
    // Subscribe to rentals collection
    const unsubscribeRentals = firestoreService.subscribeToRentals(setRentals);
    
    // Return cleanup function
    return {
      unsubscribeAll: () => {
        unsubscribeVehicles();
        unsubscribeCustomers();
        unsubscribeInsurances();
        unsubscribeRegistrations();
        unsubscribeMaintenances();
        unsubscribeAnnualFees();
        unsubscribeIncidents();
        unsubscribeRentals();
      }
    };
  };
  
  // Function to refresh all subscriptions
  const refreshSubscriptions = () => {
    setIsRefreshing(true);
    
    // Clean up existing subscriptions
    if (unsubscribeRef.current) {
      unsubscribeRef.current.unsubscribeAll();
    }
    
    // Set up new subscriptions
    unsubscribeRef.current = setupSubscriptions();
    
    setLastRefreshed(new Date());
    setIsRefreshing(false);
  };
  
  // Ref to store unsubscribe functions
  const unsubscribeRef = useRef<{ unsubscribeAll: () => void } | null>(null);
  
  // Set up subscriptions to Firestore collections
  useEffect(() => {
    // Set up initial subscriptions
    unsubscribeRef.current = setupSubscriptions();
    setLastRefreshed(new Date());
    
    // Clean up subscriptions when component unmounts
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current.unsubscribeAll();
      }
    };
  }, []);
  
  // Add a periodic refresh to handle potential subscription issues
  useEffect(() => {
    // Refresh subscriptions every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('Performing periodic subscription refresh');
      refreshSubscriptions();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  /**
   * Adds a new vehicle to the garage.
   * @param vehicle - The vehicle object (excluding the ID) to add.
   */
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    firestoreService.addVehicle(vehicle)
      .catch(error => console.error('Error adding vehicle:', error));
  };

  /**
   * Updates an existing vehicle in the garage.
   * @param id - The ID of the vehicle to update.
   * @param updates - An object containing the updates to apply to the vehicle.
   */
  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    firestoreService.updateVehicle(id, updates)
      .catch(error => console.error('Error updating vehicle:', error));
  };

  /**
   * Deletes a vehicle from the garage.
   * @param id - The ID of the vehicle to delete.
   */
  const deleteVehicle = (id: string) => {
    firestoreService.deleteVehicle(id)
      .catch(error => console.error('Error deleting vehicle:', error));
  };

  /**
   * Adds a new customer.
   * @param customer - The customer object (excluding the ID and createdAt) to add.
   */
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    console.log('Adding customer:', customer);
    firestoreService.addCustomer(customer)
      .then(newCustomer => console.log('Customer added successfully:', newCustomer))
      .catch(error => console.error('Error adding customer:', error));
  };

  /**
   * Updates an existing customer.
   * @param id - The ID of the customer to update.
   * @param updates - An object containing the updates to apply to the customer.
   */
  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    firestoreService.updateCustomer(id, updates)
      .catch(error => console.error('Error updating customer:', error));
  };

  /**
   * Retrieves a customer by their ID.
   * @param id - The ID of the customer to retrieve.
   * @returns The customer object, or undefined if not found.
   */
  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  };

  /**
   * Deletes a customer.
   * @param id - The ID of the customer to delete.
   */
  const deleteCustomer = (id: string) => {
    firestoreService.deleteCustomer(id)
      .catch(error => console.error('Error deleting customer:', error));
  };

  /**
   * Adds a new insurance policy.
   * @param insurance - The insurance object (excluding the ID) to add.
   */
  const addInsurance = (insurance: Omit<Insurance, 'id'>) => {
    firestoreService.addInsurance(insurance)
      .catch(error => console.error('Error adding insurance:', error));
  };

  /**
   * Updates an existing insurance policy.
   * @param id - The ID of the insurance policy to update.
   * @param updates - An object containing the updates to apply.
   */
  const updateInsurance = (id: string, updates: Partial<Insurance>) => {
    firestoreService.updateInsurance(id, updates)
      .catch(error => console.error('Error updating insurance:', error));
  };

  /**
   * Deletes an insurance policy.
   * @param id - The ID of the insurance policy to delete.
   */
  const deleteInsurance = (id: string) => {
    firestoreService.deleteInsurance(id)
      .catch(error => console.error('Error deleting insurance:', error));
  };

  /**
   * Adds a new vehicle registration.
   * @param registration - The registration object (excluding the ID) to add.
   */
  const addRegistration = (registration: Omit<Registration, 'id'>) => {
    firestoreService.addRegistration(registration)
      .catch(error => console.error('Error adding registration:', error));
  };

  /**
   * Updates an existing vehicle registration.
   * @param id - The ID of the registration to update.
   * @param updates - An object containing the updates to apply.
   */
  const updateRegistration = (id: string, updates: Partial<Registration>) => {
    firestoreService.updateRegistration(id, updates)
      .catch(error => console.error('Error updating registration:', error));
  };

  /**
   * Deletes a vehicle registration.
   * @param id - The ID of the registration to delete.
   */
  const deleteRegistration = (id: string) => {
    firestoreService.deleteRegistration(id)
      .catch(error => console.error('Error deleting registration:', error));
  };

  /**
   * Adds a new maintenance record.
   * @param maintenance - The maintenance object (excluding the ID) to add.
   */
  const addMaintenance = (maintenance: Omit<Maintenance, 'id'>) => {
    firestoreService.addMaintenance(maintenance)
      .catch(error => console.error('Error adding maintenance:', error));
  };

  /**
   * Updates an existing maintenance record.
   * @param id - The ID of the maintenance record to update.
   * @param updates - An object containing the updates to apply.
   */
  const updateMaintenance = (id: string, updates: Partial<Maintenance>) => {
    firestoreService.updateMaintenance(id, updates)
      .catch(error => console.error('Error updating maintenance:', error));
  };

  /**
   * Deletes a maintenance record.
   * @param id - The ID of the maintenance record to delete.
   */
  const deleteMaintenance = (id: string) => {
    firestoreService.deleteMaintenance(id)
      .catch(error => console.error('Error deleting maintenance:', error));
  };

  /**
   * Adds a new annual fee.
   * @param fee - The annual fee object (excluding the ID) to add.
   */
  const addAnnualFee = (fee: Omit<AnnualFee, 'id'>) => {
    firestoreService.addAnnualFee(fee)
      .catch(error => console.error('Error adding annual fee:', error));
  };

  /**
   * Updates an existing annual fee.
   * @param id - The ID of the annual fee to update.
   * @param updates - An object containing the updates to apply.
   */
  const updateAnnualFee = (id: string, updates: Partial<AnnualFee>) => {
    firestoreService.updateAnnualFee(id, updates)
      .catch(error => console.error('Error updating annual fee:', error));
  };

  /**
   * Deletes an annual fee.
   * @param id - The ID of the annual fee to delete.
   */
  const deleteAnnualFee = (id: string) => {
    firestoreService.deleteAnnualFee(id)
      .catch(error => console.error('Error deleting annual fee:', error));
  };

  /**
   * Adds a new incident.
   * @param incident - The incident object (excluding the ID) to add.
   */
  const addIncident = (incident: Omit<Incident, 'id'>) => {
    firestoreService.addIncident(incident)
      .catch(error => console.error('Error adding incident:', error));
  };

  /**
   * Updates an existing incident.
   * @param id - The ID of the incident to update.
   * @param updates - An object containing the updates to apply.
   */
  const updateIncident = (id: string, updates: Partial<Incident>) => {
    firestoreService.updateIncident(id, updates)
      .catch(error => console.error('Error updating incident:', error));
  };

  /**
   * Deletes an incident.
   * @param id - The ID of the incident to delete.
   */
  const deleteIncident = (id: string) => {
    firestoreService.deleteIncident(id)
      .catch(error => console.error('Error deleting incident:', error));
  };

  /**
   * Rents a vehicle.
   * @param vehicleId - The ID of the vehicle being rented.
   * @param rental - The rental details (excluding ID, vehicleId and status).
   */
  const rentVehicle = (vehicleId: string, rental: Omit<Rental, 'id' | 'vehicleId' | 'status'>) => {
    const newRental: Omit<Rental, 'id'> = { 
      ...rental, 
      vehicleId: vehicleId, 
      status: 'active' 
    };
    
    firestoreService.addRental(newRental)
      .then(addedRental => {
        // Update the vehicle status
        const vehicleUpdates: Partial<Vehicle> = {
          isRented: true,
          currentRentalId: addedRental.id
        };
        return firestoreService.updateVehicle(vehicleId, vehicleUpdates);
      })
      .catch(error => console.error('Error renting vehicle:', error));
  };

  /**
   * Completes a rental.
   * @param rentalId - The ID of the rental to complete.
   */
  const completeRental = (rentalId: string) => {
    // Find the rental first to get its vehicleId
    const rental = rentals.find(r => r.id === rentalId);
    
    if (!rental) {
      console.error(`Rental with ID ${rentalId} not found`);
      return;
    }
    
    const vehicleId = rental.vehicleId;
    
    // Update the rental status
    firestoreService.updateRental(rentalId, { status: 'completed' })
      .then(() => {
        // Update the vehicle status
        return firestoreService.updateVehicle(vehicleId, {
          isRented: false,
          currentRentalId: null
        });
      })
      .catch(error => console.error('Error completing rental:', error));
  };

  /**
   * Cancels a rental.
   * @param rentalId - The ID of the rental to cancel.
   */
  const cancelRental = (rentalId: string) => {
    // Find the rental first to get its vehicleId
    const rental = rentals.find(r => r.id === rentalId);
    
    if (!rental) {
      console.error(`Rental with ID ${rentalId} not found`);
      return;
    }
    
    const vehicleId = rental.vehicleId;
    
    // Update the rental status
    firestoreService.updateRental(rentalId, { status: 'cancelled' })
      .then(() => {
        // Update the vehicle status
        return firestoreService.updateVehicle(vehicleId, {
          isRented: false,
          currentRentalId: null
        });
      })
      .catch(error => console.error('Error cancelling rental:', error));
  };
  
  /**
   * Utility function to sync vehicle rental status with active rentals
   * This helps maintain consistency between vehicles and rentals
   */
  const syncVehicleRentalStatus = () => {
    // Find all active rentals
    const activeRentals = rentals.filter(r => r.status === 'active');
    const rentedVehicleIds = new Set(activeRentals.map(r => r.vehicleId));
    
    // Update all vehicle statuses based on active rentals
    setVehicles(prevVehicles => {
      return prevVehicles.map(vehicle => {
        const shouldBeRented = rentedVehicleIds.has(vehicle.id);
        
        // If the status is already correct, don't change it
        if (shouldBeRented === !!vehicle.isRented) {
          return vehicle;
        }
        
        // Fix inconsistent rental status
        if (shouldBeRented) {
          // Find the active rental for this vehicle
          const activeRental = activeRentals.find(r => r.vehicleId === vehicle.id);
          return { 
            ...vehicle, 
            isRented: true,
            currentRentalId: activeRental ? activeRental.id : undefined
          };
        } else {
          // No active rental for this vehicle
          return { 
            ...vehicle, 
            isRented: false,
            currentRentalId: undefined
          };
        }
      });
    });
  };
  
  // Run the sync function whenever rentals or vehicles change
  useEffect(() => {
    syncVehicleRentalStatus();
  }, [rentals]);

  /**
   * Extends a rental period
   */
  const extendRental = (rentalId: string, extension: { endTime: string, additionalFee: number }) => {
    // Find the rental first to get its current rental fee
    const rental = rentals.find(r => r.id === rentalId);
    
    if (!rental || rental.status !== 'active') {
      console.error(`Active rental with ID ${rentalId} not found`);
      return;
    }
    
    // Calculate the new rental fee
    const newRentalFee = rental.rentalFee + extension.additionalFee;
    
    // Update the rental with extended end time and increased fee
    firestoreService.updateRental(rentalId, {
      endTime: extension.endTime,
      rentalFee: newRentalFee
    })
    .catch(error => console.error('Error extending rental:', error));
  };
  
  /**
   * Calculate time remaining in milliseconds for a rental
   */
  const getRentalTimeRemaining = (rentalId: string): number => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental || rental.status !== 'active') {
      return 0;
    }
    
    const endTime = new Date(rental.endTime).getTime();
    const now = new Date().getTime();
    
    return Math.max(0, endTime - now);
  };

  /**
   * Get a rental by ID
   */
  const getRentalById = (rentalId: string): Rental | undefined => {
    return rentals.find(rental => rental.id === rentalId);
  };

  /**
   * Get all rentals for a specific customer
   */
  const getRentalsByCustomerId = (customerId: string): Rental[] => {
    return rentals.filter(rental => 
      rental.customerId === customerId || 
      rental.renter.customerId === customerId ||
      (rental.renter.id && rental.renter.id === customerId)
    );
  };

  return (
    <GarageContext.Provider
      value={{
        vehicles,
        customers,
        insurances,
        registrations,
        maintenances,
        annualFees,
        incidents,
        rentals,
        isRefreshing,
        lastRefreshed,
        refreshSubscriptions,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
        addInsurance,
        updateInsurance,
        deleteInsurance,
        addRegistration,
        updateRegistration,
        deleteRegistration,
        addMaintenance,
        updateMaintenance,
        deleteMaintenance,
        addAnnualFee,
        updateAnnualFee,
        deleteAnnualFee,
        addIncident,
        updateIncident,
        deleteIncident,
        rentVehicle,
        completeRental,
        cancelRental,
        extendRental,
        getRentalTimeRemaining,
        getRentalById,
        getRentalsByCustomerId,
      }}
    >
      {children}
    </GarageContext.Provider>
  );
};

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vin?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  imageUrl?: string;
  isRented?: boolean;
  currentRentalId?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  idImageUrl?: string;
  createdAt: string;
  notes?: string;
  rentalHistory?: string[]; // Array of rental IDs
}

export interface Insurance {
  id: string;
  vehicleId: string;
  provider: string;
  policyNumber: string;
  startDate: string;
  expiryDate: string;
  premium: number;
  coverage: string;
  documents?: string[];
}

export interface Registration {
  id: string;
  vehicleId: string;
  expiryDate: string;
  fee: number;
  state: string;
  renewalUrl?: string;
  documents?: string[];
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: string;
  date: string;
  mileage: number;
  description: string;
  cost: number;
  documents?: string[];
  shop?: string;
}

export interface AnnualFee {
  id: string;
  vehicleId: string;
  name: string;
  amount: number;
  dueDate: string;
  description?: string;
  isPaid: boolean;
  paidDate?: string;
  category: 'tax' | 'permit' | 'subscription' | 'other';
  recurring: boolean;
  documents?: string[];
}

export interface Incident {
  id: string;
  vehicleId: string;
  date: string;
  type: 'accident' | 'theft' | 'damage' | 'other';
  description: string;
  location?: string;
  cost?: number;
  insuranceClaim?: boolean;
  documents?: string[];
}

export interface Renter {
  id?: string; // Add optional id field for customer reference
  fullName: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  idImageUrl?: string;
  customerId?: string; // Reference to customer in the database
}

export interface Rental {
  id: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  renter: Renter;
  rentalFee: number;
  status: 'active' | 'completed' | 'cancelled';
  customerId?: string; // Reference to customer in the database
}

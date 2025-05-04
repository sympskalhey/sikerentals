
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGarage } from '@/context/GarageContext';

const VehicleSummary = () => {
  const { vehicles, customers, rentals } = useGarage();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh every 30 seconds to catch any status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Count vehicles by different criteria
  const totalVehicles = vehicles.length;
  
  // Calculate available vehicles by checking which ones are not rented
  const availableVehicles = vehicles.filter(vehicle => !vehicle.isRented).length;
  const rentedVehicles = totalVehicles - availableVehicles;
  
  // Count customers
  const totalCustomers = customers.length;

  // Additional check to ensure the availability count is accurate
  // by looking at active rentals
  const activeRentalsCount = rentals.filter(rental => rental.status === 'active').length;
  
  // If there's a mismatch between rentedVehicles and activeRentalsCount, log for debugging
  if (rentedVehicles !== activeRentalsCount) {
    console.log('Mismatch between rented vehicles count and active rentals count:', { 
      rentedVehicles, 
      activeRentalsCount 
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate('/vehicles')}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Total Vehicles</h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car text-garage-blue"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-2"/><path d="M5 17H3c-.6 0-1-.4-1-1v-3c0-.6.4-1 1-1h2"/><rect width="14" height="8" x="5" y="9" rx="2"/><circle cx="9" cy="17" r="2"/><circle cx="15" cy="17" r="2"/><path d="M5 9 8 2h8l3 7"/></svg>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">{totalVehicles}</div>
            <p className="text-sm text-muted-foreground">Vehicles in your garage</p>
          </div>
          <Button variant="ghost" className="p-0 h-auto" onClick={(e) => { e.stopPropagation(); navigate('/vehicles/add'); }}>
            Add Vehicle
          </Button>
        </div>
      </div>
      
      <div 
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate('/vehicles')}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Availability</h3>
          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
            {availableVehicles} Available
          </div>
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div style={{ 
              width: `${totalVehicles > 0 ? (availableVehicles / totalVehicles) * 100 : 0}%` 
            }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-sm text-muted-foreground">Available</div>
                <div className="font-semibold">{availableVehicles} vehicles</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rented</div>
                <div className="font-semibold">{rentedVehicles} vehicles</div>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="p-0 h-auto"
            onClick={(e) => { e.stopPropagation(); navigate('/rentals'); }}
          >
            View Rentals
          </Button>
        </div>
      </div>
      
      <div 
        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate('/customers')}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Customers</h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users text-garage-blue"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">{totalCustomers}</div>
            <p className="text-sm text-muted-foreground">Registered customers</p>
          </div>
          <Button variant="ghost" className="p-0 h-auto" onClick={(e) => { e.stopPropagation(); navigate('/customers/add'); }}>
            Add Customer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VehicleSummary;

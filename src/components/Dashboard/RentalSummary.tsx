
import React, { useState, useEffect } from 'react';
import { useGarage } from '@/context/GarageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RentalSummary = () => {
  const { rentals, vehicles } = useGarage();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Force refresh every 30 seconds to catch any status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Get active rentals
  const activeRentals = rentals.filter(rental => rental.status === 'active');
  
  // Find vehicles with active rentals
  const rentedVehicles = activeRentals.map(rental => {
    const vehicle = vehicles.find(v => v.id === rental.vehicleId);
    return {
      rental,
      vehicle: vehicle ? vehicle : null
    };
  }).filter(item => item.vehicle !== null);

  // Count available vehicles (not rented)
  const availableVehicles = vehicles.filter(v => !v.isRented).length;

  // Calculate total revenue from completed rentals
  const totalRevenue = rentals
    .filter(rental => rental.status === 'completed')
    .reduce((total, rental) => total + rental.rentalFee, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/rentals')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-garage-blue">Active Rentals</CardTitle>
            <CardDescription>Currently rented vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car text-garage-blue mr-3"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-2"/><path d="M5 17H3c-.6 0-1-.4-1-1v-3c0-.6.4-1 1-1h2"/><rect width="14" height="8" x="5" y="9" rx="2"/><circle cx="9" cy="17" r="2"/><circle cx="15" cy="17" r="2"/><path d="M5 9 8 2h8l3 7"/></svg>
              <span className="text-3xl font-bold">{activeRentals.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/rental-records')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-garage-blue">Total Revenue</CardTitle>
            <CardDescription>From completed rentals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check text-garage-blue mr-3"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
              <span className="text-3xl font-bold">
                MVR{totalRevenue.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/vehicles')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-garage-blue">Available Vehicles</CardTitle>
            <CardDescription>Vehicles ready to rent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-car text-green-500 mr-3"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-2"/><path d="M5 17H3c-.6 0-1-.4-1-1v-3c0-.6.4-1 1-1h2"/><rect width="14" height="8" x="5" y="9" rx="2"/><circle cx="9" cy="17" r="2"/><circle cx="15" cy="17" r="2"/><path d="M5 9 8 2h8l3 7"/></svg>
                <span className="text-3xl font-bold">{availableVehicles}</span>
              </div>
              <Button variant="ghost" className="text-garage-blue p-0" onClick={(e) => {e.stopPropagation(); navigate('/vehicles');}}>View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Rentals</h3>
        <Button 
          variant="outline"
          size="sm" 
          onClick={() => navigate('/rental-records')}
        >
          View All Records
        </Button>
      </div>

      {activeRentals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currently Rented Vehicles</CardTitle>
            <CardDescription>Vehicles that are currently being rented</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {rentedVehicles.map(({rental, vehicle}) => vehicle && (
                <li key={rental.id} className="p-3 bg-green-50 rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{vehicle.licensePlate}</p>
                    <p className="text-sm text-gray-600">Rented by: {rental.renter.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Return by: {new Date(rental.endTime).toLocaleString()}
                    </p>
                    <Button 
                      size="sm" 
                      variant="link" 
                      className="p-0 h-auto" 
                      onClick={() => navigate(`/rentals/${rental.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RentalSummary;

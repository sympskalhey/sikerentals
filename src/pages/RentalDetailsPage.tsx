
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const RentalDetailsContent = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const { getRentalById, vehicles, completeRental, cancelRental, getRentalTimeRemaining } = useGarage();
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState<string>('');
  
  const rental = rentalId ? getRentalById(rentalId) : undefined;
  const vehicle = rental ? vehicles.find(v => v.id === rental.vehicleId) : undefined;
  
  useEffect(() => {
    if (rental && rental.status === 'active') {
      // Update remaining time initially
      updateRemainingTime();
      
      // Update remaining time every minute
      const interval = setInterval(updateRemainingTime, 60000);
      
      return () => clearInterval(interval);
    }
  }, [rental]);
  
  const updateRemainingTime = () => {
    if (!rental) return;
    
    const remainingMs = getRentalTimeRemaining(rental.id);
    
    if (remainingMs <= 0) {
      setRemainingTime('Expired');
      return;
    }
    
    // Convert milliseconds to hours, minutes
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    setRemainingTime(`${hours} hours, ${minutes} minutes`);
  };

  if (!rental || !vehicle) {
    return (
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/rentals')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rentals
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-garage-red">Rental Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The rental you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleComplete = () => {
    completeRental(rental.id);
    navigate('/rentals');
  };

  const handleCancel = () => {
    cancelRental(rental.id);
    navigate('/rentals');
  };

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/rentals')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rentals
        </Button>
        
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-garage-blue">
              Rental Details
            </h1>
            <p className="text-muted-foreground">
              Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
          
          <div className={`px-4 py-1 rounded-full text-white ${
            rental.status === 'active' 
              ? 'bg-green-500' 
              : rental.status === 'completed' 
                ? 'bg-blue-500' 
                : 'bg-red-500'
          }`}>
            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" /> Renter Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{rental.renter.fullName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium">{rental.renter.idNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{rental.renter.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Driver's License</p>
                  <p className="font-medium">{rental.renter.licenseNumber}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{rental.renter.address}</p>
              </div>
              
              {rental.renter.idImageUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">ID Document</p>
                  <div className="border rounded-md p-1 inline-block">
                    <img 
                      src={rental.renter.idImageUrl} 
                      alt="ID Document" 
                      className="max-h-40 object-contain"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" /> Rental Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date & Time</p>
                  <p className="font-medium">{new Date(rental.startTime).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">End Date & Time</p>
                  <p className="font-medium">{new Date(rental.endTime).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Rental Fee</p>
                <p className="font-medium">${rental.rentalFee.toFixed(2)}</p>
              </div>
              
              {rental.status === 'active' && (
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="flex items-center text-green-700 mb-1">
                    <Clock className="mr-2 h-4 w-4" />
                    <p className="font-medium">Time Remaining</p>
                  </div>
                  <p className="font-bold text-green-800">{remainingTime}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicle.imageUrl && (
                <div className="mb-4">
                  <img 
                    src={vehicle.imageUrl} 
                    alt={`${vehicle.licensePlate} ${vehicle.make} ${vehicle.model}`} 
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">
                 {vehicle.licensePlate} {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{vehicle.color}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">License Plate</p>
                <p className="font-medium">{vehicle.licensePlate}</p>
              </div>
              
              {vehicle.vin && (
                <div>
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-medium">{vehicle.vin}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {rental.status === 'active' && (
            <div className="mt-6 space-y-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleComplete}
              >
                Mark as Returned
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleCancel}
              >
                Cancel Rental
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const RentalDetailsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <RentalDetailsContent />
      </main>
      <Footer />
    </div>
  );
};

export default RentalDetailsPage;

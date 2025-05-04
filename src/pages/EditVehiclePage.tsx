import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import VehicleForm from '@/components/vehicles/VehicleForm';
import { Vehicle } from '@/types/garage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const EditVehicleContent = () => {
  const { id } = useParams<{ id: string }>();
  const { vehicles, updateVehicle } = useGarage();
  const navigate = useNavigate();
  
  // Find the vehicle with the matching ID
  const vehicle = vehicles.find(v => v.id === id);
  
  const handleSubmit = (updatedVehicleData: Omit<Vehicle, 'id'>) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Vehicle ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    // Update the vehicle with the correct parameters
    updateVehicle(id, updatedVehicleData);
    
    // Navigate back to the vehicles list or vehicle details
    navigate(`/vehicles/${id}`);
  };
  
  const handleCancel = () => {
    navigate(`/vehicles/${id}`);
  };

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Vehicle not found</h2>
        <p className="text-muted-foreground mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/vehicles')}>Back to Vehicles</Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-muted-foreground mb-4"
          onClick={handleCancel}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Vehicle
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-garage-blue">Edit Vehicle</h1>
        <p className="text-muted-foreground">
          Update the details for your {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <VehicleForm 
          onSubmit={handleSubmit} 
          initialData={vehicle} 
          buttonText="Save Changes"
        />
      </div>
    </>
  );
};

const EditVehiclePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <EditVehicleContent />
      </main>
      <Footer />
    </div>
  );
};

export default EditVehiclePage;

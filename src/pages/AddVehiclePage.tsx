
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import VehicleForm from '@/components/vehicles/VehicleForm';
import { Vehicle } from '@/types/garage';

const AddVehicleContent = () => {
  const { addVehicle } = useGarage();
  const navigate = useNavigate();

  const handleSubmit = (vehicle: Omit<Vehicle, 'id'>) => {
    addVehicle(vehicle);
    // Force navigation after adding vehicle to ensure context is refreshed
    setTimeout(() => {
      navigate('/vehicles');
    }, 100);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-garage-blue">Add New Vehicle</h1>
        <p className="text-muted-foreground">Enter the details for your new vehicle.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <VehicleForm onSubmit={handleSubmit} />
      </div>
    </>
  );
};

const AddVehiclePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <AddVehicleContent />
      </main>
      <Footer />
    </div>
  );
};

export default AddVehiclePage;

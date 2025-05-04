import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGarage } from '@/context/GarageContext';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';
import { Maintenance } from '@/types/garage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const AddMaintenancePage: React.FC = () => {
  const { addMaintenance, vehicles } = useGarage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleIdFromUrl = queryParams.get('vehicleId');
  const [loading, setLoading] = useState(true);

  // Log vehicles for debugging
  useEffect(() => {
    console.log('Vehicles in AddMaintenancePage:', vehicles);
    setLoading(false);
  }, [vehicles]);

  const handleSubmit = (data: Omit<Maintenance, 'id'>) => {
    try {
      // If vehicleId is provided in URL params, ensure it's used
      const maintenanceData = vehicleIdFromUrl 
        ? { ...data, vehicleId: vehicleIdFromUrl } 
        : data;
      
      console.log('Adding maintenance record:', maintenanceData);
      addMaintenance(maintenanceData);
      
      toast.success('Maintenance record added successfully');
      navigate('/maintenance');
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      toast.error('Failed to add maintenance record');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <div className="max-w-2xl mx-auto text-center">
            <p>Loading vehicles...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if vehicles are available
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-6 text-garage-blue">Add Maintenance Record</h1>
            <p className="mb-4">No vehicles found. Please add a vehicle first.</p>
            <button 
              onClick={() => navigate('/vehicles/add')}
              className="bg-garage-blue text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Vehicle
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-garage-blue">Add Maintenance Record</h1>
          <MaintenanceForm 
            onSubmit={handleSubmit} 
            initialData={undefined}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddMaintenancePage;
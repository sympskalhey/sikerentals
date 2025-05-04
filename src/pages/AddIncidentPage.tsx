import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGarage } from '@/context/GarageContext';
import IncidentForm from '@/components/incidents/IncidentForm';
import { Incident } from '@/types/garage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const AddIncidentPage: React.FC = () => {
  const { addIncident } = useGarage();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleId = queryParams.get('vehicleId');

  const handleSubmit = (data: Omit<Incident, 'id'>) => {
    try {
      // If vehicleId is provided in URL params, ensure it's used
      const incidentData = vehicleId 
        ? { ...data, vehicleId } 
        : data;
      
      console.log('Adding incident report:', incidentData);
      addIncident(incidentData);
      
      toast.success('Incident report added successfully');
      // Navigate to documents page since there's no dedicated incidents page
      navigate('/documents');
    } catch (error) {
      console.error('Error adding incident report:', error);
      toast.error('Failed to add incident report');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-garage-blue">Add Incident Report</h1>
          <IncidentForm 
            onSubmit={handleSubmit} 
            initialData={vehicleId ? { vehicleId } as Partial<Incident> as Incident : undefined}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddIncidentPage;
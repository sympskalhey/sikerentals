import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGarage } from '@/context/GarageContext';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm';
import { Maintenance } from '@/types/garage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EditMaintenancePage: React.FC = () => {
  const { maintenances, updateMaintenance } = useGarage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [maintenance, setMaintenance] = useState<Maintenance | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      const foundMaintenance = maintenances.find(m => m.id === id);
      if (foundMaintenance) {
        setMaintenance(foundMaintenance);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
  }, [id, maintenances]);

  const handleSubmit = (data: Omit<Maintenance, 'id'>) => {
    try {
      if (!id) return;
      
      console.log('Updating maintenance record:', data);
      updateMaintenance(id, data);
      
      toast.success('Maintenance record updated successfully');
      navigate('/maintenance');
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      toast.error('Failed to update maintenance record');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-garage-blue">Edit Maintenance Record</h1>
          
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading maintenance record...</p>
              </CardContent>
            </Card>
          ) : notFound ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Maintenance record not found. <a href="/maintenance" className="underline">Return to maintenance records</a>
              </AlertDescription>
            </Alert>
          ) : (
            <MaintenanceForm onSubmit={handleSubmit} initialData={maintenance} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditMaintenancePage;
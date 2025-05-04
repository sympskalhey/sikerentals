import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGarage } from '@/context/GarageContext';
import IncidentForm from '@/components/incidents/IncidentForm';
import { Incident } from '@/types/garage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EditIncidentPage: React.FC = () => {
  const { incidents, updateIncident } = useGarage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      const foundIncident = incidents.find(i => i.id === id);
      if (foundIncident) {
        setIncident(foundIncident);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
  }, [id, incidents]);

  const handleSubmit = (data: Omit<Incident, 'id'>) => {
    try {
      if (!id) return;
      
      console.log('Updating incident report:', data);
      updateIncident(id, data);
      
      toast.success('Incident report updated successfully');
      // Navigate to documents page since there's no dedicated incidents page
      navigate('/documents');
    } catch (error) {
      console.error('Error updating incident report:', error);
      toast.error('Failed to update incident report');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-garage-blue">Edit Incident Report</h1>
          
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading incident report...</p>
              </CardContent>
            </Card>
          ) : notFound ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Incident report not found. <a href="/documents" className="underline">Return to documents</a>
              </AlertDescription>
            </Alert>
          ) : (
            <IncidentForm onSubmit={handleSubmit} initialData={incident} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditIncidentPage;
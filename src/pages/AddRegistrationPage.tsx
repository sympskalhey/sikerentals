
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useGarage } from '@/context/GarageContext';
import { GarageProvider } from '@/context/GarageContext';
import RegistrationForm from '@/components/registration/RegistrationForm';

const AddRegistrationContent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { registrations, addRegistration, updateRegistration } = useGarage();
  
  const isEditing = !!id;
  const registration = isEditing ? registrations.find(r => r.id === id) : undefined;

  if (isEditing && !registration) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-garage-blue mb-4">Registration Not Found</h2>
        <p className="mb-6">The registration you're trying to edit doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/registration')}>
          Back to Registrations
        </Button>
      </div>
    );
  }
  
  const handleSubmit = (data: any) => {
    if (isEditing && registration) {
      updateRegistration(registration.id, {
        ...data,
        expiryDate: data.expiryDate.toISOString(),
      });
    } else {
      addRegistration({
        ...data,
        expiryDate: data.expiryDate.toISOString(),
      });
    }
    navigate('/registration');
  };
  
  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/registration')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-garage-blue flex items-center">
          <ClipboardList className="h-6 w-6 mr-2" />
          {isEditing ? 'Edit Vehicle Registration' : 'Add Vehicle Registration'}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Registration Details' : 'New Vehicle Registration'}</CardTitle>
        </CardHeader>
        <CardContent>
          <RegistrationForm 
            registration={registration} 
            isEditing={isEditing} 
            onSubmit={handleSubmit} 
          />
        </CardContent>
      </Card>
    </>
  );
};

const AddRegistrationPage: React.FC = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <AddRegistrationContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default AddRegistrationPage;


import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useGarage } from '@/context/GarageContext';
import { GarageProvider } from '@/context/GarageContext';
import InsuranceForm from '@/components/insurance/InsuranceForm';

const AddInsuranceContent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { insurances } = useGarage();
  
  const isEditing = !!id;
  const insurance = isEditing ? insurances.find(i => i.id === id) : undefined;

  if (isEditing && !insurance) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-garage-blue mb-4">Insurance Policy Not Found</h2>
        <p className="mb-6">The insurance policy you're trying to edit doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/insurance')}>
          Back to Insurance
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/insurance')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-garage-blue flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          {isEditing ? 'Edit Insurance Policy' : 'Add Insurance Policy'}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Policy Details' : 'New Insurance Policy'}</CardTitle>
        </CardHeader>
        <CardContent>
          <InsuranceForm insurance={insurance} isEditing={isEditing} />
        </CardContent>
      </Card>
    </>
  );
};

const AddInsurancePage: React.FC = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <AddInsuranceContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default AddInsurancePage;

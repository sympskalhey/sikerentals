
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGarage, GarageProvider } from '@/context/GarageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnualFeeForm from '@/components/annualfees/AnnualFeeForm';
import { AnnualFee } from '@/types/garage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';

const AddAnnualFeeContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const { addAnnualFee, updateAnnualFee, annualFees, vehicles } = useGarage();
  
  // Get the vehicleId from query params (if available)
  const vehicleIdFromQuery = searchParams.get('vehicleId');
  
  // Check if we're editing an existing fee
  const isEditing = !!id;
  const existingFee = isEditing ? annualFees.find(fee => fee.id === id) : undefined;
  
  const handleSubmit = (feeData: Omit<AnnualFee, 'id'>) => {
    // Ensure all required fields are present
    if (!feeData.name || !feeData.vehicleId || feeData.amount === undefined || 
        !feeData.dueDate || feeData.isPaid === undefined || !feeData.category || feeData.recurring === undefined) {
      console.error("Missing required fields in annual fee data:", feeData);
      return;
    }
    
    if (isEditing && id) {
      updateAnnualFee(id, feeData);
    } else {
      addAnnualFee(feeData);
    }
    navigate('/annualfees');
  };
  
  const vehicleId = existingFee?.vehicleId || vehicleIdFromQuery || '';
  const vehicle = vehicles.find(v => v.id === vehicleId);
  
  const handleCancel = () => {
    navigate('/annualfees');
  };
  
  return (
    <>
      <div className="mb-4">
        <Button 
          variant="ghost" 
          className="flex items-center text-muted-foreground mb-4"
          onClick={handleCancel}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Annual Fees
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-garage-blue">
          {isEditing ? 'Edit Annual Fee' : 'Add Annual Fee'}
        </h1>
        <p className="text-muted-foreground">
          {vehicle 
            ? `${isEditing ? 'Edit' : 'Add'} annual fee for your ${vehicle.year} ${vehicle.make} ${vehicle.model}`
            : `${isEditing ? 'Edit' : 'Add'} a new annual fee for your vehicle`}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <AnnualFeeForm 
          onSubmit={handleSubmit} 
          initialData={existingFee}
          buttonText={isEditing ? 'Save Changes' : 'Add Annual Fee'} 
        />
      </div>
    </>
  );
};

const AddAnnualFeePage = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <AddAnnualFeeContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default AddAnnualFeePage;

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GarageProvider, useGarage } from '@/context/GarageContext';
import { useNavigate, useParams } from 'react-router-dom';
import CustomerForm from '@/components/customers/CustomerForm';
import { Customer } from '@/types/garage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EditCustomerContent = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, updateCustomer } = useGarage();
  const navigate = useNavigate();
  
  const customer = customerId ? getCustomerById(customerId) : undefined;
  
  const handleSubmit = (customerData: Omit<Customer, 'id' | 'createdAt' | 'rentalHistory'>) => {
    if (customer && customerId) {
      updateCustomer(customerId, customerData);
      navigate(`/customers/${customer.id}`);
    }
  };

  if (!customer) {
    return (
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
        
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Customer not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button className="mb-4" variant="outline" onClick={() => navigate(`/customers/${customer.id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer Details
      </Button>
      
      <h1 className="text-3xl font-bold text-garage-blue mb-2">Edit Customer</h1>
      <p className="text-muted-foreground mb-6">Update information for {customer.fullName}</p>
      
      <Card className="p-6">
        <CustomerForm customer={customer} onSubmit={handleSubmit} />
      </Card>
    </div>
  );
};

const EditCustomerPage = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <EditCustomerContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default EditCustomerPage;

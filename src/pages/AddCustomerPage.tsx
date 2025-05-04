
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import CustomerForm from '@/components/customers/CustomerForm';
import { Customer } from '@/types/garage';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AddCustomerContent = () => {
  const { addCustomer } = useGarage();
  const navigate = useNavigate();
  
  const handleSubmit = (customerData: Omit<Customer, 'id' | 'createdAt' | 'rentalHistory'>) => {
    console.log('AddCustomerPage received form data:', customerData);
    console.log('Calling addCustomer with data...');
    addCustomer(customerData);
    console.log('Customer added, navigating to /customers');
    navigate('/customers');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Button className="mb-4" variant="outline" onClick={() => navigate('/customers')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
      </Button>
      
      <h1 className="text-3xl font-bold text-garage-blue mb-2">Add New Customer</h1>
      <p className="text-muted-foreground mb-6">Create a new customer profile in your database.</p>
      
      <Card className="p-6">
        <CustomerForm onSubmit={handleSubmit} />
      </Card>
    </div>
  );
};

const AddCustomerPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <AddCustomerContent />
      </main>
      <Footer />
    </div>
  );
};

export default AddCustomerPage;

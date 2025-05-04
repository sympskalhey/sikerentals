
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useGarage } from '@/context/GarageContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, UserRound, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import CustomerCard from '@/components/customers/CustomerCard';

const CustomersList = () => {
  const { customers, refreshSubscriptions, isRefreshing, lastRefreshed } = useGarage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  console.log('CustomersPage - customers from context:', customers);

  // Format the last refresh time
  const formatLastRefreshed = () => {
    if (!lastRefreshed) return 'Never';
    
    // Format the date as a readable string
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastRefreshed);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refreshSubscriptions();
  };
  
  const filteredCustomers = customers.filter(customer => {
    if (searchTerm === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      customer.fullName.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      customer.licenseNumber.toLowerCase().includes(searchLower)
    );
  });
  
  console.log('CustomersPage - filtered customers:', filteredCustomers);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-garage-blue">Customer Database</h1>
          <p className="text-muted-foreground">Manage your rental customers.</p>
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="h-10 w-10"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh data</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
                <p className="text-xs text-muted-foreground">Last refreshed: {formatLastRefreshed()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button className="bg-garage-blue hover:bg-garage-blue/90" onClick={() => navigate('/customers/add')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search by name, email, phone, or license..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserRound className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          {customers.length > 0 ? (
            <>
              <p className="text-lg mb-2">No customers match your search.</p>
              <p className="text-muted-foreground">Try a different search term.</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">No customers found.</p>
              <p className="text-muted-foreground mb-6">Start by adding your first customer.</p>
              <Button onClick={() => navigate('/customers/add')}>
                Add Customer
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
};

const CustomersPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4 flex-grow">
        <CustomersList />
      </main>
      <Footer />
    </div>
  );
};

export default CustomersPage;

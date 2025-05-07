
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GarageProvider, useGarage } from '@/context/GarageContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Edit, Trash, UserRound, CarFront } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import RentalCard from '@/components/rentals/RentalCard';

const CustomerDetailsContent = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, deleteCustomer, getRentalsByCustomerId, vehicles } = useGarage();
  const navigate = useNavigate();
  
  const customer = customerId ? getCustomerById(customerId) : undefined;
  const customerRentals = customerId ? getRentalsByCustomerId(customerId) : [];
  
  if (!customer) {
    return (
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-garage-red">Customer Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The customer you're looking for doesn't exist or has been deleted.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = () => {
    deleteCustomer(customer.id);
    navigate('/customers');
  };

  return (
    <>
      <div className="mb-8">
        <Button className="mb-4" variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
        </Button>
        
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-garage-blue">
              {customer.fullName}
            </h1>
            <p className="text-muted-foreground">
              Customer since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center" 
              onClick={() => navigate(`/customers/edit/${customer.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the customer "{customer.fullName}" and cannot be undone.
                    {customerRentals.length > 0 && (
                      <span className="text-red-500 block mt-2">
                        Warning: This customer has {customerRentals.length} rental records associated with them.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete Customer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              className="bg-garage-blue hover:bg-garage-blue/90" 
              onClick={() => navigate(`/customers/${customer.id}/rent`)}
            >
              <CarFront className="mr-2 h-4 w-4" />
              Rent Vehicle
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserRound className="mr-2 h-5 w-5" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID Number</p>
                  <p className="font-medium">{customer.idNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{customer.phone}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{customer.address}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Driver's License</p>
                <p className="font-medium">{customer.licenseNumber}</p>
              </div>
              
              {customer.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{customer.notes}</p>
                </div>
              )}
              
              {customer.idImageUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">ID Document</p>
                  <div className="border rounded-md p-1 inline-block">
                    <img 
                      src={customer.idImageUrl} 
                      alt="ID Document" 
                      className="max-h-40 object-contain"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" /> Rental History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customerRentals.length > 0 ? (
                <div className="space-y-4">
                  {customerRentals.map((rental) => {
                    const vehicle = vehicles.find(v => v.id === rental.vehicleId);
                    if (!vehicle) return null;
                    
                    return (
                      <RentalCard key={rental.id} rental={rental} vehicle={vehicle} />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No rental history yet.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate(`/customers/${customer.id}/rent`)}
                  >
                    Create First Rental
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-garage-blue hover:bg-garage-blue/90" 
                onClick={() => navigate(`/customers/${customer.id}/rent`)}
              >
                <CarFront className="mr-2 h-4 w-4" />
                Rent Vehicle
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate(`/customers/edit/${customer.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

const CustomerDetailsPage = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <CustomerDetailsContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default CustomerDetailsPage;

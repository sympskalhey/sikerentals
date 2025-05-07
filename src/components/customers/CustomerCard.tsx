
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/garage';
import { useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useGarage } from '@/context/GarageContext';

interface CustomerCardProps {
  customer: Customer;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  const navigate = useNavigate();
  const { getRentalsByCustomerId } = useGarage();
  
  const rentals = getRentalsByCustomerId(customer.id);
  const rentalCount = rentals.length;
  const activeRental = rentals.find(rental => rental.status === 'active');
  
  const dateFormatted = new Date(customer.createdAt).toLocaleDateString();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{customer.fullName}</span>
          {activeRental && (
            <span className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">
              Active Rental
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 rounded-full p-3 flex-shrink-0">
              <UserRound className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{customer.idNumber}</p>
              <p className="text-sm text-gray-500">{customer.phone}</p>
              <p className="text-sm text-gray-500 line-clamp-1">{customer.address}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500">License #</p>
              <p className="font-medium">{customer.licenseNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Customer since</p>
              <p className="font-medium">{dateFormatted}</p>
            </div>
          </div>
          
          {rentalCount > 0 && (
            <div className="bg-blue-50 p-2 rounded text-center">
              <span className="text-sm font-medium text-blue-700">
                {rentalCount} rental{rentalCount !== 1 ? 's' : ''} to date
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1" 
          onClick={() => navigate(`/customers/${customer.id}`)}
        >
          View Details
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1" 
          onClick={() => navigate(`/customers/${customer.id}/rent`)}
        >
          Rent Vehicle
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerCard;

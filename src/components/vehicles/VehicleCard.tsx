
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/garage';
import { useNavigate } from 'react-router-dom';
import { CarFront, Pencil, CircleX, CircleCheck } from 'lucide-react';
import { useGarage } from '@/context/GarageContext';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { deleteVehicle } = useGarage();
  const navigate = useNavigate();
  
  const handleView = () => {
    navigate(`/vehicles/${vehicle.id}`);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/vehicles/edit/${vehicle.id}`);
  };
  
  const handleRent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vehicle.isRented) {
      // Prevent renting already rented vehicles
      return;
    }
    navigate(`/vehicles/${vehicle.id}/rent`);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this ${vehicle.year} ${vehicle.make} ${vehicle.model}?`)) {
      deleteVehicle(vehicle.id);
    }
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={handleView}>
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {vehicle.imageUrl ? (
          <img 
            src={vehicle.imageUrl} 
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <CarFront className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {vehicle.isRented ? (
          <div className="absolute top-0 right-0 bg-red-500 text-white font-bold px-3 py-1 flex items-center">
            <CircleX className="w-4 h-4 mr-1" />
            RENTED
          </div>
        ) : (
          <div className="absolute top-0 right-0 bg-green-500 text-white font-bold px-3 py-1 flex items-center">
            <CircleCheck className="w-4 h-4 mr-1" />
            AVAILABLE
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
          <Button variant="ghost" size="icon" onClick={handleEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-x-4 text-sm">
          <div>
            <p className="font-medium">License Plate</p>
            <p className="text-muted-foreground">{vehicle.licensePlate}</p>
          </div>
          <div>
            <p className="font-medium">Color</p>
            <p className="text-muted-foreground">{vehicle.color}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleDelete}>
          Delete
        </Button>
        
        <Button 
          variant={vehicle.isRented ? "outline" : "default"} 
          size="sm" 
          onClick={handleRent}
          disabled={vehicle.isRented}
          className={vehicle.isRented ? "cursor-not-allowed" : ""}
        >
          {vehicle.isRented ? 'Currently Rented' : 'Rent'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;

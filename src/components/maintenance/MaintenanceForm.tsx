import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGarage } from '@/context/GarageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Maintenance } from '@/types/garage';

// Define the form schema with Zod
const maintenanceFormSchema = z.object({
  vehicleId: z.string().min(1, { message: 'Vehicle is required' }),
  type: z.string().min(1, { message: 'Type is required' }),
  date: z.date({ required_error: 'Date is required' }),
  mileage: z.number().min(0, { message: 'Mileage must be a positive number' }),
  description: z.string().min(1, { message: 'Description is required' }),
  cost: z.number().min(0, { message: 'Cost must be a positive number' }),
  shop: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormProps {
  onSubmit: (data: Omit<Maintenance, 'id'>) => void;
  initialData?: Maintenance;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ onSubmit, initialData }) => {
  const { vehicles } = useGarage();
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );

  // Initialize the form with react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: new Date(initialData.date),
        }
      : {
          vehicleId: '',
          type: '',
          date: new Date(),
          mileage: 0,
          description: '',
          cost: 0,
          shop: '',
        },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        date: new Date(initialData.date),
      });
      setDate(new Date(initialData.date));
    }
  }, [initialData, reset]);

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setValue('date', selectedDate, { shouldValidate: true });
    }
  };

  // Process form submission
  const processSubmit = (data: MaintenanceFormValues) => {
    // Ensure all required properties are included and properly typed
    const maintenanceData: Omit<Maintenance, 'id'> = {
      vehicleId: data.vehicleId,
      type: data.type,
      date: data.date.toISOString(),
      mileage: data.mileage,
      description: data.description,
      cost: data.cost,
      shop: data.shop,
      documents: initialData?.documents || [],
    };
    
    onSubmit(maintenanceData);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      {/* Vehicle Selection */}
      <div className="space-y-2">
        <Label htmlFor="vehicleId">Vehicle <span className="text-red-500">*</span></Label>
        <Select
          onValueChange={(value) => setValue('vehicleId', value, { shouldValidate: true })}
          defaultValue={initialData?.vehicleId || ''}
        >
          <SelectTrigger id="vehicleId">
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicleId && (
          <p className="text-red-500 text-sm">{errors.vehicleId.message}</p>
        )}
      </div>

      {/* Maintenance Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Maintenance Type <span className="text-red-500">*</span></Label>
        <Input
          id="type"
          placeholder="Oil Change, Tire Rotation, Brake Service, etc."
          {...register('type')}
        />
        {errors.type && (
          <p className="text-red-500 text-sm">{errors.type.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-red-500 text-sm">{errors.date.message}</p>
        )}
      </div>

      {/* Mileage */}
      <div className="space-y-2">
        <Label htmlFor="mileage">Mileage <span className="text-red-500">*</span></Label>
        <Input
          id="mileage"
          type="number"
          placeholder="Current vehicle mileage"
          {...register('mileage', { valueAsNumber: true })}
        />
        {errors.mileage && (
          <p className="text-red-500 text-sm">{errors.mileage.message}</p>
        )}
      </div>

      {/* Cost */}
      <div className="space-y-2">
        <Label htmlFor="cost">Cost <span className="text-red-500">*</span></Label>
        <div className="relative">
          <span className="absolute left-3 top-2">MVR</span>
          <Input
            id="cost"
            type="number"
            step="0.01"
            className="pl-12"
            placeholder="0.00"
            {...register('cost', { valueAsNumber: true })}
          />
        </div>
        {errors.cost && (
          <p className="text-red-500 text-sm">{errors.cost.message}</p>
        )}
      </div>

      {/* Shop */}
      <div className="space-y-2">
        <Label htmlFor="shop">Shop/Service Provider</Label>
        <Input
          id="shop"
          placeholder="Name of shop or service provider"
          {...register('shop')}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
        <Textarea
          id="description"
          placeholder="Describe the maintenance performed"
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        {initialData ? 'Update Maintenance Record' : 'Add Maintenance Record'}
      </Button>
    </form>
  );
};

export default MaintenanceForm;
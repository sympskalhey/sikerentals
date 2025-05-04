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
import { Checkbox } from '@/components/ui/checkbox';
import { Incident } from '@/types/garage';

// Define the form schema with Zod
const incidentFormSchema = z.object({
  vehicleId: z.string().min(1, { message: 'Vehicle is required' }),
  type: z.enum(['accident', 'theft', 'damage', 'other'], {
    required_error: 'Incident type is required',
  }),
  date: z.date({ required_error: 'Date is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  location: z.string().optional(),
  cost: z.number().min(0, { message: 'Cost must be a positive number' }).optional(),
  insuranceClaim: z.boolean().default(false),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  onSubmit: (data: Omit<Incident, 'id'>) => void;
  initialData?: Incident;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ onSubmit, initialData }) => {
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
    watch,
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          date: new Date(initialData.date),
        }
      : {
          vehicleId: '',
          type: 'accident',
          date: new Date(),
          description: '',
          location: '',
          cost: undefined,
          insuranceClaim: false,
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
  const processSubmit = (data: IncidentFormValues) => {
    // Ensure all required properties are included and properly typed
    const incidentData: Omit<Incident, 'id'> = {
      vehicleId: data.vehicleId,
      type: data.type,
      date: data.date.toISOString(),
      description: data.description,
      location: data.location,
      cost: data.cost,
      insuranceClaim: data.insuranceClaim,
      documents: initialData?.documents || [],
    };
    
    onSubmit(incidentData);
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

      {/* Incident Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Incident Type <span className="text-red-500">*</span></Label>
        <Select
          onValueChange={(value) => setValue('type', value as 'accident' | 'theft' | 'damage' | 'other', { shouldValidate: true })}
          defaultValue={initialData?.type || 'accident'}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select incident type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accident">Accident</SelectItem>
            <SelectItem value="theft">Theft</SelectItem>
            <SelectItem value="damage">Damage</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Where did the incident occur?"
          {...register('location')}
        />
      </div>

      {/* Cost */}
      <div className="space-y-2">
        <Label htmlFor="cost">Cost (if known)</Label>
        <div className="relative">
          <span className="absolute left-3 top-2">$</span>
          <Input
            id="cost"
            type="number"
            step="0.01"
            className="pl-7"
            placeholder="0.00"
            {...register('cost', { valueAsNumber: true })}
          />
        </div>
        {errors.cost && (
          <p className="text-red-500 text-sm">{errors.cost.message}</p>
        )}
      </div>

      {/* Insurance Claim */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="insuranceClaim"
          checked={watch('insuranceClaim')}
          onCheckedChange={(checked) => 
            setValue('insuranceClaim', checked as boolean, { shouldValidate: true })
          }
        />
        <Label htmlFor="insuranceClaim">Insurance claim filed</Label>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
        <Textarea
          id="description"
          placeholder="Describe what happened"
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        {initialData ? 'Update Incident Report' : 'Add Incident Report'}
      </Button>
    </form>
  );
};

export default IncidentForm;
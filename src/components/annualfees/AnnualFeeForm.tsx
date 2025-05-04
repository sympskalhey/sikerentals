import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useGarage } from '@/context/GarageContext';
import { AnnualFee } from '@/types/garage';

const formSchema = z.object({
  vehicleId: z.string({ required_error: "Please select a vehicle" }),
  name: z.string().min(2, { message: "Fee name must be at least 2 characters" }),
  amount: z.coerce.number().min(0, { message: "Amount must be a positive number" }),
  dueDate: z.date({ required_error: "Due date is required" }),
  description: z.string().optional(),
  isPaid: z.boolean().default(false),
  paidDate: z.date().optional().nullable(),
  category: z.enum(['tax', 'permit', 'subscription', 'other'], {
    required_error: "Please select a category",
  }),
  recurring: z.boolean().default(true),
  documents: z.array(z.string()).optional(),
});

type AnnualFeeFormValues = z.infer<typeof formSchema>;

interface AnnualFeeFormProps {
  onSubmit: (data: Omit<AnnualFee, 'id'>) => void;
  initialData?: AnnualFee;
  buttonText?: string;
}

const AnnualFeeForm: React.FC<AnnualFeeFormProps> = ({ 
  onSubmit, 
  initialData, 
  buttonText = "Add Annual Fee" 
}) => {
  const { vehicles } = useGarage();
  
  // Initialize form with default values or initial data if editing
  const form = useForm<AnnualFeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined,
      paidDate: initialData.paidDate ? new Date(initialData.paidDate) : null,
    } : {
      isPaid: false,
      recurring: true,
      documents: [],
      category: 'other',
    }
  });
  
  const isPaid = form.watch('isPaid');
  
  function handleFormSubmit(values: AnnualFeeFormValues) {
    // Construct the object with all required fields, ensuring none are optional
    const feeData: Omit<AnnualFee, 'id'> = {
      vehicleId: values.vehicleId,
      name: values.name,
      amount: values.amount,
      dueDate: values.dueDate.toISOString().split('T')[0],
      isPaid: values.isPaid,
      category: values.category,
      recurring: values.recurring ?? true,
      // Handle optional fields properly
      description: values.description || '',
      paidDate: values.paidDate ? values.paidDate.toISOString().split('T')[0] : undefined,
      documents: values.documents || [],
    };
    
    onSubmit(feeData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fee Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Annual Fee, Road Worthiness" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="permit">Permit</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Recurring Fee</FormLabel>
                <FormDescription>
                  This fee repeats annually
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isPaid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Paid</FormLabel>
                <FormDescription>
                  Mark this fee as paid
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {isPaid && (
          <FormField
            control={form.control}
            name="paidDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Payment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional details about this fee" 
                  className="resize-none" 
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">{buttonText}</Button>
      </form>
    </Form>
  );
};

export default AnnualFeeForm;

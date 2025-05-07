import React, { useState } from 'react';
import { Customer } from '@/types/garage';
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

type CustomerFormProps = {
  customer?: Customer;
  onSubmit: (data: Omit<Customer, 'id' | 'createdAt' | 'rentalHistory'>) => void;
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit }) => {
  const [idImage, setIdImage] = useState<File | null>(null);
  const [idImagePreview, setIdImagePreview] = useState<string | undefined>(
    customer?.idImageUrl
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: customer ? {
      fullName: customer.fullName,
      idNumber: customer.idNumber,
      phone: customer.phone,
      address: customer.address,
      licenseNumber: customer.licenseNumber,
      notes: customer.notes || '',
    } : {}
  });

  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processSubmit = (data: any) => {
    console.log('Form data before processing:', data);
    
    // Convert File to data URL for storage
    if (idImage) {
      console.log('Processing ID image...');
      const reader = new FileReader();
      reader.onload = (event) => {
        const idImageUrl = event.target?.result as string;
        console.log('ID image processed, submitting with image URL');
        const submitData = {
          ...data,
          idImageUrl
        };
        console.log('Final form data with image:', submitData);
        onSubmit(submitData);
      };
      reader.readAsDataURL(idImage);
    } else {
      // Keep existing image or no image
      console.log('No new ID image, submitting with existing or no image');
      const submitData = {
        ...data,
        idImageUrl: idImagePreview
      };
      console.log('Final form data:', submitData);
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={(e) => {
      console.log('Form submitted');
      handleSubmit(processSubmit)(e);
    }} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name*</Label>
          <Input
            id="fullName"
            {...register('fullName', { required: 'Full name is required' })}
            placeholder="Ahmed Mohamed"
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">{errors.fullName.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="idNumber">ID Card Number*</Label>
            <Input
              id="IdNumber"
              type="IdNumber"
              {...register('idNumber', { 
                required: 'ID number is required',
                pattern: {
                  value: /^[A-Z0-9]+$/i,
                  message: "Invalid ID number format."
                }
              })}
              placeholder="A123456"
              className={errors.idNumber ? 'border-red-500' : ''}
            />
            {errors.idNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.idNumber.message as string}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number*</Label>
            <Input
              id="phone"
              {...register('phone', { required: 'Phone number is required' })}
              placeholder="7xxxxxx , 9xxxxxx"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone.message as string}</p>
            )}
          </div>
        </div>

        <div>
  <Label htmlFor="address">Address</Label>
  <Input
    id="address"
    {...register('address')}
    placeholder="address / island name"
    className={errors.address ? 'border-red-500' : ''}
  />
  {errors.address && (
    <p className="text-sm text-red-500 mt-1">{errors.address.message as string}</p>
  )}
</div>

        <div>
          <Label htmlFor="licenseNumber">Driver's License Number*</Label>
          <Input
            id="licenseNumber"
            {...register('licenseNumber', { required: "Driver's license number is required" })}
            placeholder="Axxxxxx"
            className={errors.licenseNumber ? 'border-red-500' : ''}
          />
          {errors.licenseNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.licenseNumber.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="idImage">ID Document (Driver's License)</Label>
          <Card className="mt-1 cursor-pointer">
            <CardContent className="p-4">
              <label htmlFor="idImage" className="flex flex-col items-center gap-2 cursor-pointer">
                {idImagePreview ? (
                  <div className="mt-2">
                    <img 
                      src={idImagePreview} 
                      alt="ID Preview" 
                      className="max-h-40 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm">Upload ID or driver's license</p>
                    <p className="text-xs text-muted-foreground">Click to browse</p>
                  </div>
                )}
                <input
                  id="idImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIdImageChange}
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Any additional information about the customer..."
            rows={3}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-garage-blue hover:bg-garage-blue/90"
        disabled={isSubmitting}
      >
        {customer ? 'Update Customer' : 'Add Customer'}
      </Button>
    </form>
  );
};

export default CustomerForm;

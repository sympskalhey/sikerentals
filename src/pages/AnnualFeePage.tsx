
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGarage } from '@/context/GarageContext';
import { GarageProvider } from '@/context/GarageContext';
import { useNavigate } from 'react-router-dom';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { CalendarCheck, Receipt, CalendarX, Plus, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnnualFee } from '@/types/garage';

const getCategoryIcon = (category: AnnualFee['category']) => {
  switch (category) {
    case 'tax': 
      return <Receipt className="h-4 w-4" />;
    case 'permit':
      return <Badge className="h-4 w-4" />;
    case 'subscription':
      return <Receipt className="h-4 w-4" />;
    default:
      return <Receipt className="h-4 w-4" />;
  }
};

const getCategoryBadge = (category: AnnualFee['category']): { label: string, variant: BadgeProps['variant'] } => {
  switch (category) {
    case 'tax': 
      return { label: 'Tax', variant: 'destructive' };
    case 'permit':
      return { label: 'Permit', variant: 'outline' };
    case 'subscription':
      return { label: 'Subscription', variant: 'secondary' };
    default:
      return { label: 'Other', variant: 'default' };
  }
};

// Separate the content to use the useGarage hook within the GarageProvider
const AnnualFeePageContent = () => {
  const { vehicles, annualFees } = useGarage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Group annual fees by vehicle
  const vehicleAnnualFees = vehicles.map(vehicle => {
    const vehicleFees = annualFees.filter(fee => fee.vehicleId === vehicle.id);
    return {
      vehicle,
      fees: vehicleFees
    };
  });
  
  // Find upcoming fees (due within 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingFees = annualFees.filter(fee => {
    if (fee.isPaid) return false;
    const dueDate = new Date(fee.dueDate);
    return dueDate <= thirtyDaysFromNow;
  });
  
  // Find overdue fees
  const overdueFees = annualFees.filter(fee => {
    if (fee.isPaid) return false;
    const dueDate = new Date(fee.dueDate);
    return dueDate < today;
  });

  // Find paid fees
  const paidFees = annualFees.filter(fee => fee.isPaid);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-garage-blue">Annual Fees</h1>
        <Button onClick={() => navigate('/annualfees/add')} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add New Fee
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Fees</TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center">
            Overdue
            {overdueFees.length > 0 && (
              <span className="ml-1 rounded-full bg-red-100 text-red-800 text-xs px-2">
                {overdueFees.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            Upcoming
            {upcomingFees.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-100 text-amber-800 text-xs px-2">
                {upcomingFees.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-6">
            {vehicleAnnualFees.map(({ vehicle, fees }) => (
              <Card key={vehicle.id} className="overflow-hidden">
                <CardHeader className="bg-garage-blue text-white flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription className="text-garage-silver">
                      {fees.length > 0 ? `${fees.length} Annual ${fees.length === 1 ? 'Fee' : 'Fees'}` : 'No Annual Fees'}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white text-garage-blue hover:bg-white/90"
                    onClick={() => navigate(`/annualfees/add?vehicleId=${vehicle.id}`)}
                  >
                    Add Fee
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {fees.length > 0 ? (
                    <div className="divide-y">
                      {fees.map(fee => {
                        const dueDate = new Date(fee.dueDate);
                        const isOverdue = !fee.isPaid && dueDate < today;
                        const isDueSoon = !fee.isPaid && !isOverdue && dueDate <= thirtyDaysFromNow;
                        const categoryInfo = getCategoryBadge(fee.category);
                        
                        return (
                          <div 
                            key={fee.id} 
                            className={`p-4 ${isOverdue ? 'bg-red-50' : isDueSoon ? 'bg-amber-50' : fee.isPaid ? 'bg-green-50' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-lg flex items-center">
                                  {fee.name}
                                  {isOverdue ? (
                                    <span className="ml-2 inline-flex items-center text-xs font-medium text-red-700 bg-red-100 rounded-full px-2.5 py-0.5">
                                      <CalendarX className="w-3 h-3 mr-1" />
                                      Overdue
                                    </span>
                                  ) : isDueSoon ? (
                                    <span className="ml-2 inline-flex items-center text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Due Soon
                                    </span>
                                  ) : fee.isPaid ? (
                                    <span className="ml-2 inline-flex items-center text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">
                                      <CalendarCheck className="w-3 h-3 mr-1" />
                                      Paid
                                    </span>
                                  ) : null}
                                </h3>
                                <div className="flex items-center mt-1">
                                  <Badge variant={categoryInfo.variant} className="mr-2">
                                    {categoryInfo.label}
                                  </Badge>
                                  {fee.recurring && (
                                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                                      Recurring
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/annualfees/edit/${fee.id}`)}
                              >
                                Edit
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-medium">${fee.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Due Date</p>
                                <p className="font-medium">{new Date(fee.dueDate).toLocaleDateString()}</p>
                              </div>
                              {fee.isPaid && fee.paidDate && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Paid On</p>
                                  <p className="font-medium">{new Date(fee.paidDate).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                            
                            {fee.description && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <p>{fee.description}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No annual fees found for this vehicle.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate(`/annualfees/add?vehicleId=${vehicle.id}`)}
                      >
                        Add Annual Fee
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {vehicles.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold text-garage-blue mb-2">No Vehicles Found</h2>
                <p className="text-muted-foreground mb-6">Add vehicles to your garage to manage their annual fees.</p>
                <Button onClick={() => navigate('/vehicles/add')}>
                  Add Vehicle
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="overdue" className="mt-4">
          {overdueFees.length > 0 ? (
            <div className="space-y-4">
              {overdueFees.map(fee => {
                const vehicle = vehicles.find(v => v.id === fee.vehicleId);
                const categoryInfo = getCategoryBadge(fee.category);
                
                return (
                  <Card key={fee.id} className="overflow-hidden border-red-200">
                    <CardHeader className="bg-red-50 flex flex-row items-center justify-between py-3">
                      <div>
                        <CardTitle className="flex items-center text-base">
                          <CalendarX className="w-4 h-4 mr-2 text-red-600" />
                          <span className="text-red-800">{fee.name}</span>
                        </CardTitle>
                        <CardDescription>
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                        </CardDescription>
                      </div>
                      <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium text-red-700">{new Date(fee.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-medium">${fee.amount.toFixed(2)}</p>
                        </div>
                        <div className="md:text-right">
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/annualfees/edit/${fee.id}`)}
                          >
                            Mark as Paid
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No Overdue Fees</h2>
              <p className="text-muted-foreground">All your annual fees are up to date.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          {upcomingFees.length > 0 ? (
            <div className="space-y-4">
              {upcomingFees.map(fee => {
                const vehicle = vehicles.find(v => v.id === fee.vehicleId);
                const dueDate = new Date(fee.dueDate);
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const categoryInfo = getCategoryBadge(fee.category);
                
                return (
                  <Card key={fee.id} className="overflow-hidden border-amber-200">
                    <CardHeader className="bg-amber-50 flex flex-row items-center justify-between py-3">
                      <div>
                        <CardTitle className="flex items-center text-base">
                          <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
                          <span className="text-amber-800">{fee.name}</span>
                        </CardTitle>
                        <CardDescription>
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                        </CardDescription>
                      </div>
                      <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium text-amber-700">
                            {new Date(fee.dueDate).toLocaleDateString()} 
                            <span className="ml-2 text-xs">
                              ({daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'} left)
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-medium">${fee.amount.toFixed(2)}</p>
                        </div>
                        <div className="md:text-right">
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/annualfees/edit/${fee.id}`)}
                          >
                            Mark as Paid
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarCheck className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No Upcoming Dues</h2>
              <p className="text-muted-foreground">You don't have any annual fees due in the next 30 days.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="paid" className="mt-4">
          {paidFees.length > 0 ? (
            <div className="space-y-4">
              {paidFees.map(fee => {
                const vehicle = vehicles.find(v => v.id === fee.vehicleId);
                const categoryInfo = getCategoryBadge(fee.category);
                
                return (
                  <Card key={fee.id} className="overflow-hidden border-green-200">
                    <CardHeader className="bg-green-50 flex flex-row items-center justify-between py-3">
                      <div>
                        <CardTitle className="flex items-center text-base">
                          <CalendarCheck className="w-4 h-4 mr-2 text-green-600" />
                          <span className="text-green-800">{fee.name}</span>
                        </CardTitle>
                        <CardDescription>
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                        </CardDescription>
                      </div>
                      <Badge variant={categoryInfo.variant}>{categoryInfo.label}</Badge>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium">{new Date(fee.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Paid On</p>
                          <p className="font-medium text-green-700">
                            {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-medium">${fee.amount.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Receipt className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium text-gray-900 mb-2">No Paid Fees</h2>
              <p className="text-muted-foreground">You haven't marked any annual fees as paid yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

// Main component wrapped in GarageProvider
const AnnualFeePage = () => {
  return (
    <GarageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto py-8 px-4 flex-grow">
          <AnnualFeePageContent />
        </main>
        <Footer />
      </div>
    </GarageProvider>
  );
};

export default AnnualFeePage;

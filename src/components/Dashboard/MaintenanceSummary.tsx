
import React from 'react';
import { useGarage } from '@/context/GarageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const MaintenanceSummary = () => {
  const { vehicles, maintenances } = useGarage();
  const navigate = useNavigate();
  
  // Get recent maintenance
  const recentMaintenances = [...maintenances]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(maintenance => {
      const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
      return { 
        ...maintenance, 
        vehicleName: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'
      };
    });
    
  // Calculate total maintenance costs
  const totalMaintenanceCost = maintenances.reduce((total, maintenance) => total + maintenance.cost, 0);
  
  // Get maintenance count by type
  const maintenanceByType = maintenances.reduce((acc, maintenance) => {
    acc[maintenance.type] = (acc[maintenance.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get top 3 maintenance types
  const topMaintenanceTypes = Object.entries(maintenanceByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/maintenance')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-garage-blue">Maintenance Records</CardTitle>
            <CardDescription>Total maintenance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench text-garage-blue mr-3"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              <span className="text-3xl font-bold">{maintenances.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-garage-blue">Total Expenses</CardTitle>
            <CardDescription>Lifetime maintenance costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign text-garage-blue mr-3"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-3xl font-bold">MVR{totalMaintenanceCost.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-garage-blue">Common Services</CardTitle>
            <CardDescription>Most frequent maintenance types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topMaintenanceTypes.length > 0 ? (
                topMaintenanceTypes.map(([type, count], index) => (
                  <div key={index} className="flex justify-between">
                    <span>{type}</span>
                    <span className="font-medium">{count} times</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No maintenance records yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-garage-blue">Recent Maintenance</CardTitle>
          <CardDescription>Latest service records for your vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMaintenances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Vehicle</th>
                    <th className="pb-2">Service</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMaintenances.map((maintenance) => (
                    <tr key={maintenance.id} className="border-b last:border-0">
                      <td className="py-3">{maintenance.vehicleName}</td>
                      <td className="py-3">{maintenance.type}</td>
                      <td className="py-3">{new Date(maintenance.date).toLocaleDateString()}</td>
                      <td className="py-3">MVR{maintenance.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">No maintenance records yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSummary;

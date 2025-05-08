
import React from 'react';
import { useGarage } from '@/context/GarageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const IncidentSummary = () => {
  const { vehicles, incidents } = useGarage();
  const navigate = useNavigate();
  
  // Get recent incidents
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(incident => {
      const vehicle = vehicles.find(v => v.id === incident.vehicleId);
      return { 
        ...incident, 
        vehicleName: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'
      };
    });
    
  // Calculate total incident costs
  const totalIncidentCost = incidents.reduce((total, incident) => total + (incident.cost || 0), 0);
  
  // Count incidents by type
  const incidentsByType = incidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/incidents')}>
      <CardHeader>
        <CardTitle className="text-garage-blue">Incidents & Claims</CardTitle>
        <CardDescription>Summary of accidents and insurance claims</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-garage-silver/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Incidents</p>
            <p className="text-2xl font-bold">{incidents.length}</p>
          </div>
          
          <div className="bg-garage-silver/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Cost</p>
            <p className="text-2xl font-bold">MVR  {totalIncidentCost.toFixed(2)}</p>
          </div>
          
          <div className="bg-garage-silver/30 p-3 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Insurance Claims</p>
            <p className="text-2xl font-bold">
              {incidents.filter(i => i.insuranceClaim).length}
            </p>
          </div>
        </div>
        
        {recentIncidents.length > 0 ? (
          <div>
            <h3 className="font-medium text-sm text-gray-500 mb-2">Recent Incidents:</h3>
            <div className="space-y-2">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="p-2 bg-garage-silver/20 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{incident.vehicleName}</span>
                    <span>{new Date(incident.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-1 text-gray-600">{incident.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No incident records yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentSummary;

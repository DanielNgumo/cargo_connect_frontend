// src/BookShipment.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Route {
  id: number; // Integer IDs
  from_location: string;
  to_location: string;
  sea_price_per_cbm: number | null;
  air_price_per_kg: number | null;
  min_kg_air: number;
  min_cbm_sea: number;
  agent: { id: string; name: string };
}

const BookShipment = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [formData, setFormData] = useState({
    route_id: '',
    mode: 'air',
    weight_kg: '',
    cbm: '',
    warehouse_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingRoutes, setFetchingRoutes] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No auth token found');
        }
        console.log('Fetching routes with token:', token.substring(0, 10) + '...');
        const response = await fetch('http://127.0.0.1:8000/api/shipping-routes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('Routes response:', data);
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch routes');
        }
        setRoutes(data.routes || []);
        console.log('Available route IDs:', data.routes.map((r: Route) => r.id));
      } catch (err: any) {
        console.error('Fetch routes error:', err.message);
        toast.error(err.message);
      } finally {
        setFetchingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        route_id: parseInt(formData.route_id), // Convert to integer
        mode: formData.mode,
        weight_kg: formData.mode === 'air' && formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        cbm: formData.mode === 'sea' && formData.cbm ? parseFloat(formData.cbm) : null,
        warehouse_address: formData.warehouse_address,
      };
      console.log('Creating shipment:', payload);
      const response = await fetch('http://127.0.0.1:8000/api/shipments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('Shipment response:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create shipment');
      }
      toast.success('Shipment booked successfully!');
      setFormData({
        route_id: '',
        mode: 'air',
        weight_kg: '',
        cbm: '',
        warehouse_address: '',
      });
    } catch (err: any) {
      console.error('Shipment error:', err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8 flex items-center justify-center">
      <div className="relative max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Book a Shipment</h1>
        {fetchingRoutes ? (
          <p>Loading routes...</p>
        ) : routes.length === 0 ? (
          <p>No routes available.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Select Route</label>
              <select
                name="route_id"
                value={formData.route_id}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.from_location} to {route.to_location} (Agent: {route.agent.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Mode</label>
              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="air">Air</option>
                <option value="sea">Sea</option>
              </select>
            </div>
            {formData.mode === 'air' && (
              <div className="mb-4">
                <label className="block text-gray-700">Weight (KG)</label>
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                  step="0.1"
                  min="1"
                />
              </div>
            )}
            {formData.mode === 'sea' && (
              <div className="mb-4">
                <label className="block text-gray-700">Volume (CBM)</label>
                <input
                  type="number"
                  name="cbm"
                  value={formData.cbm}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                  step="0.01"
                  min="0.1"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700">Warehouse Address</label>
              <input
                type="text"
                name="warehouse_address"
                value={formData.warehouse_address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Book Shipment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookShipment;
// src/routes/CreateRoute.tsx
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { MapPin, Ship, Plane } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const CreateRoute = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [seaPricePerCbm, setSeaPricePerCbm] = useState('');
  const [airPricePerKg, setAirPricePerKg] = useState('');
  const [minKgAir, setMinKgAir] = useState('1');
  const [minCbmSea, setMinCbmSea] = useState('0.1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://127.0.0.1:8000/api/shipping-routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_location: fromLocation,
          to_location: toLocation,
          sea_price_per_cbm: seaPricePerCbm || null,
          air_price_per_kg: airPricePerKg || null,
          min_kg_air: parseFloat(minKgAir),
          min_cbm_sea: parseFloat(minCbmSea),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create route');
      }

      toast.success('Shipping route created successfully!', { position: 'top-right', autoClose: 5000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Create Shipping Route</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="from_location" className="block text-sm font-medium text-gray-700 mb-1">
              From Location
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                id="from_location"
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., Nairobi, Kenya"
              />
            </div>
          </div>
          <div>
            <label htmlFor="to_location" className="block text-sm font-medium text-gray-700 mb-1">
              To Location
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                id="to_location"
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>
          <div>
            <label htmlFor="sea_price_per_cbm" className="block text-sm font-medium text-gray-700 mb-1">
              Sea Price per CBM (USD)
            </label>
            <div className="relative">
              <Ship className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                id="sea_price_per_cbm"
                type="number"
                step="0.01"
                value={seaPricePerCbm}
                onChange={(e) => setSeaPricePerCbm(e.target.value)}
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., 100.00"
              />
            </div>
          </div>
          <div>
            <label htmlFor="air_price_per_kg" className="block text-sm font-medium text-gray-700 mb-1">
              Air Price per KG (USD)
            </label>
            <div className="relative">
              <Plane className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                id="air_price_per_kg"
                type="number"
                step="0.01"
                value={airPricePerKg}
                onChange={(e) => setAirPricePerKg(e.target.value)}
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="e.g., 5.00"
              />
            </div>
          </div>
          <div>
            <label htmlFor="min_kg_air" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Air Weight (KG)
            </label>
            <input
              id="min_kg_air"
              type="number"
              step="0.01"
              value={minKgAir}
              onChange={(e) => setMinKgAir(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="e.g., 1.00"
            />
          </div>
          <div>
            <label htmlFor="min_cbm_sea" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Sea Volume (CBM)
            </label>
            <input
              id="min_cbm_sea"
              type="number"
              step="0.01"
              value={minCbmSea}
              onChange={(e) => setMinCbmSea(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="e.g., 0.10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105'
            }`}
          >
            <span>{loading ? 'Creating...' : 'Create Route'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoute;
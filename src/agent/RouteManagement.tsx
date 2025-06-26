import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Route {
  id: number;
  from_location: string;
  to_location: string;
  sea_price_per_cbm: number | null;
  air_price_per_kg: number | null;
  min_kg_air: number;
  min_cbm_sea: number;
  agent_id: number;
  agent?: { id: number; name: string; email: string };
}

const RouteManagement: React.FC = () => {
  const [routeSubTab, setRouteSubTab] = useState('create');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeForm, setRouteForm] = useState({
    from_location: '',
    to_location: '',
    sea_price_per_cbm: '',
    air_price_per_kg: '',
    min_kg_air: '1',
    min_cbm_sea: '0.1',
  });
  const [routeUpdateForm, setRouteUpdateForm] = useState({
    id: '',
    from_location: '',
    to_location: '',
    sea_price_per_cbm: '',
    air_price_per_kg: '',
    min_kg_air: '1',
    min_cbm_sea: '0.1',
  });
  const [deleteRouteId, setDeleteRouteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchRoutes = useCallback(async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/shipping-routes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setRoutes(Array.isArray(data.routes) ? data.routes : []);
    } catch (err: any) {
      console.error('Fetch routes error:', err.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchRoutes(retries - 1, delay * 2);
      }
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/shipping-routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          from_location: routeForm.from_location,
          to_location: routeForm.to_location,
          sea_price_per_cbm: routeForm.sea_price_per_cbm || null,
          air_price_per_kg: routeForm.air_price_per_kg || null,
          min_kg_air: parseFloat(routeForm.min_kg_air),
          min_cbm_sea: parseFloat(routeForm.min_cbm_sea),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create route');
      }
      setRoutes([...routes, data.route]);
      setRouteForm({
        from_location: '',
        to_location: '',
        sea_price_per_cbm: '',
        air_price_per_kg: '',
        min_kg_air: '1',
        min_cbm_sea: '0.1',
      });
      toast.success('Shipping route created successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleRouteUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch(`http://127.0.0.1:8000/api/shipping-routes/${routeUpdateForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          from_location: routeUpdateForm.from_location,
          to_location: routeUpdateForm.to_location,
          sea_price_per_cbm: routeUpdateForm.sea_price_per_cbm || null,
          air_price_per_kg: routeUpdateForm.air_price_per_kg || null,
          min_kg_air: parseFloat(routeUpdateForm.min_kg_air),
          min_cbm_sea: parseFloat(routeUpdateForm.min_cbm_sea),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update route');
      }
      setRoutes(routes.map(r => r.id === parseInt(routeUpdateForm.id) ? data.route : r));
      setRouteUpdateForm({
        id: '',
        from_location: '',
        to_location: '',
        sea_price_per_cbm: '',
        air_price_per_kg: '',
        min_kg_air: '1',
        min_cbm_sea: '0.1',
      });
      toast.success('Shipping route updated successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleRouteDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch(`http://127.0.0.1:8000/api/shipping-routes/${deleteRouteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete route');
      }
      setRoutes(routes.filter(r => r.id !== parseInt(deleteRouteId)));
      setDeleteRouteId('');
      toast.success('Shipping route deleted successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRouteForm({ ...routeForm, [e.target.name]: e.target.value });
  };

  const handleRouteUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRouteUpdateForm({ ...routeUpdateForm, [e.target.name]: e.target.value });
  };

  const formatPrice = (price: number | string | null): string => {
    if (price === null) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 'N/A' : `$${numPrice.toFixed(2)}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Route Management</h2>
      <div className="flex border-b border-gray-200 mb-6 relative">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            routeSubTab === 'create' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setRouteSubTab('create')}
        >
          Create Route
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            routeSubTab === 'view' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setRouteSubTab('view')}
        >
          View Routes
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            routeSubTab === 'update' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setRouteSubTab('update')}
        >
          Update Route
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            routeSubTab === 'delete' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setRouteSubTab('delete')}
        >
          Delete Route
        </button>
        <span
          className="absolute bottom-0 h-0.5 bg-teal-600 transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
          style={{
            width: `${100 / 4}%`,
            left: `${(['create', 'view', 'update', 'delete'].indexOf(routeSubTab) * 100) / 4}%`,
          }}
        />
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</div>
      )}
      {routeSubTab === 'create' && (
        <form onSubmit={handleRouteSubmit} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="from_location"
                value={routeForm.from_location}
                onChange={handleRouteChange}
                required
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., Nairobi, Kenya"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="to_location"
                value={routeForm.to_location}
                onChange={handleRouteChange}
                required
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sea Price per CBM (USD)</label>
            <div className="relative">
              <input
                type="number"
                name="sea_price_per_cbm"
                step="0.01"
                value={routeForm.sea_price_per_cbm}
                onChange={handleRouteChange}
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., 100.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Air Price per KG (USD)</label>
            <div className="relative">
              <input
                type="number"
                name="air_price_per_kg"
                step="0.01"
                value={routeForm.air_price_per_kg}
                onChange={handleRouteChange}
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., 5.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Air Weight (KG)</label>
            <input
              type="number"
              name="min_kg_air"
              step="0.01"
              value={routeForm.min_kg_air}
              onChange={handleRouteChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="e.g., 1.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Sea Volume (CBM)</label>
            <input
              type="number"
              name="min_cbm_sea"
              step="0.01"
              value={routeForm.min_cbm_sea}
              onChange={handleRouteChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="e.g., 0.10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-teal-800 text-white hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <span>Creating...</span>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <span>Create Route</span>
            )}
          </button>
        </form>
      )}


{routeSubTab === 'view' && (
  <div>
    {loading ? (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading routes...</span>
      </div>
    ) : routes.length === 0 ? (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <p className="text-gray-600 mt-4">No routes found.</p>
        <p className="text-gray-500 text-sm mt-1">Create a route to see it here.</p>
        <button
          onClick={() => fetchRoutes()}
          className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all"
        >
          Retry Fetching Routes
        </button>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">From</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sea Price ($/CBM)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Air Price ($/KG)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Min Air (KG)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Min Sea (CBM)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {routes.map(route => (
              <tr key={route.id} className="hover:bg-teal-25">
                <td className="px-4 py-3 text-sm text-gray-900">{route.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{route.from_location}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{route.to_location}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(route.sea_price_per_cbm)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(route.air_price_per_kg)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {typeof route.min_kg_air === 'number' ? route.min_kg_air.toFixed(2) : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {typeof route.min_cbm_sea === 'number' ? route.min_cbm_sea.toFixed(2) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      {routeSubTab === 'update' && (
        <form onSubmit={handleRouteUpdate} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <select
              name="id"
              value={routeUpdateForm.id}
              onChange={handleRouteUpdateChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="">Select Route</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.from_location} → {route.to_location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="from_location"
                value={routeUpdateForm.from_location}
                onChange={handleRouteUpdateChange}
                required
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., Nairobi, Kenya"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                name="to_location"
                value={routeUpdateForm.to_location}
                onChange={handleRouteUpdateChange}
                required
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., New York, USA"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sea Price per CBM (USD)</label>
            <div className="relative">
              <input
                type="number"
                name="sea_price_per_cbm"
                step="0.01"
                value={routeUpdateForm.sea_price_per_cbm}
                onChange={handleRouteUpdateChange}
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., 100.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Air Price per KG (USD)</label>
            <div className="relative">
              <input
                type="number"
                name="air_price_per_kg"
                step="0.01"
                value={routeUpdateForm.air_price_per_kg}
                onChange={handleRouteUpdateChange}
                disabled={loading}
                className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="e.g., 5.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Air Weight (KG)</label>
            <input
              type="number"
              name="min_kg_air"
              step="0.01"
              value={routeUpdateForm.min_kg_air}
              onChange={handleRouteUpdateChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="e.g., 1.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Sea Volume (CBM)</label>
            <input
              type="number"
              name="min_cbm_sea"
              step="0.01"
              value={routeUpdateForm.min_cbm_sea}
              onChange={handleRouteUpdateChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="e.g., 0.10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-teal-800 text-white hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <span>Updating...</span>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <span>Update Route</span>
            )}
          </button>
        </form>
      )}
      {routeSubTab === 'delete' && (
        <form onSubmit={handleRouteDelete} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <select
              value={deleteRouteId}
              onChange={e => setDeleteRouteId(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="">Select Route</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.from_location} → {route.to_location}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <span>Deleting...</span>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <span>Delete Route</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default RouteManagement;
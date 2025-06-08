import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface Agent {
  id: number;
  name: string | null;
  email: string;
}

interface ShippingRoute {
  id: number;
  from_location: string;
  to_location: string;
  agent_id: number;
  agent?: Agent;
  sea_price_per_cbm: number | null | string; // Allow string for API response
  air_price_per_kg: number | null | string;
  min_kg_air: number | string;
  min_cbm_sea: number | string;
  created_at: string;
  updated_at: string;
}

const ManageRoutes = () => {
  const [routes, setRoutes] = useState<ShippingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<ShippingRoute | null>(null);
  const navigate = useNavigate();
  const hasFetched = useRef(false); // Prevent duplicate fetches

  const fetchRoutes = async (retries = 3, delay = 1000) => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      const response = await fetch('http://127.0.0.1:8000/api/shipping-routes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        toast.error('Unauthorized. Please log in as an admin.');
        navigate('/login');
        return;
      }
      if (response.status === 404) {
        toast.error('Routes endpoint not found. Contact support.');
        setRoutes([]);
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Convert string prices to numbers
      const normalizedRoutes = (data.routes || []).map((route: ShippingRoute) => ({
        ...route,
        sea_price_per_cbm: route.sea_price_per_cbm ? parseFloat(route.sea_price_per_cbm as string) : null,
        air_price_per_kg: route.air_price_per_kg ? parseFloat(route.air_price_per_kg as string) : null,
        min_kg_air: parseFloat(route.min_kg_air as string),
        min_cbm_sea: parseFloat(route.min_cbm_sea as string),
      }));
      setRoutes(normalizedRoutes);
    } catch (err: any) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        hasFetched.current = false;
        return fetchRoutes(retries - 1, delay * 2);
      }
      toast.error(err.message || 'Failed to load routes');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      const response = await fetch(`http://127.0.0.1:8000/api/shipping-routes/${routeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        toast.error('Unauthorized. Please log in as an admin.');
        navigate('/login');
        return;
      }
      if (response.status === 404) {
        toast.error('Route not found or deletion endpoint unavailable.');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to delete route');
      }
      setRoutes(routes.filter((route) => route.id !== routeId));
      toast.success('Route deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete route');
    }
  };

  const handleView = (route: ShippingRoute) => {
    setSelectedRoute({
      ...route,
      sea_price_per_cbm: route.sea_price_per_cbm ? parseFloat(route.sea_price_per_cbm as string) : null,
      air_price_per_kg: route.air_price_per_kg ? parseFloat(route.air_price_per_kg as string) : null,
      min_kg_air: parseFloat(route.min_kg_air as string),
      min_cbm_sea: parseFloat(route.min_cbm_sea as string),
    });
  };

  const closeModal = () => {
    setSelectedRoute(null);
  };

  const getAgentDisplay = (route: ShippingRoute) => {
    if (route.agent) {
      return route.agent.email;
    }
    return route.agent_id ? `Agent ID: ${route.agent_id}` : '-';
  };

  useEffect(() => {
    fetchRoutes();
    return () => {
      hasFetched.current = false; // Cleanup on unmount
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Manage Shipping Routes</h1>

      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Loading routes...</p>
      ) : routes.length === 0 ? (
        <p className="text-gray-600">No routes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="py-3 px-4 text-left font-medium">From</th>
                <th className="py-3 px-4 text-left font-medium">To</th>
                <th className="py-3 px-4 text-left font-medium">Agent</th>
                <th className="py-3 px-4 text-left font-medium">Sea Price ($/CBM)</th>
                <th className="py-3 px-4 text-left font-medium">Air Price ($/KG)</th>
                <th className="py-3 px-4 text-left font-medium">Min KG Air</th>
                <th className="py-3 px-4 text-left font-medium">Min CBM Sea</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="py-3 px-4">{route.from_location}</td>
                  <td className="py-3 px-4">{route.to_location}</td>
                  <td className="py-3 px-4">{getAgentDisplay(route)}</td>
                  <td className="py-3 px-4">{route.sea_price_per_cbm ? Number(route.sea_price_per_cbm).toFixed(2) : '-'}</td>
                  <td className="py-3 px-4">{route.air_price_per_kg ? Number(route.air_price_per_kg).toFixed(2) : '-'}</td>
                  <td className="py-3 px-4">{Number(route.min_kg_air).toFixed(2)}</td>
                  <td className="py-3 px-4">{Number(route.min_cbm_sea).toFixed(2)}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      onClick={() => handleView(route)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">Route Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-8">
              {/* Route Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Route Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ID</label>
                    <p className="text-gray-900 font-medium">{selectedRoute.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">From Location</label>
                    <p className="text-gray-900 font-medium">{selectedRoute.from_location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">To Location</label>
                    <p className="text-gray-900 font-medium">{selectedRoute.to_location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Agent</label>
                    <p className="text-gray-900 font-medium">{getAgentDisplay(selectedRoute)}</p>
                  </div>
                </div>
              </div>

              {/* Pricing Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Sea Price ($/CBM)</label>
                    <p className="text-gray-900 font-medium">{selectedRoute.sea_price_per_cbm ? Number(selectedRoute.sea_price_per_cbm).toFixed(2) : '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Air Price ($/KG)</label>
                    <p className="text-gray-900 font-medium">{selectedRoute.air_price_per_kg ? Number(selectedRoute.air_price_per_kg).toFixed(2) : '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Minimum KG (Air)</label>
                    <p className="text-gray-900 font-medium">{Number(selectedRoute.min_kg_air).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Minimum CBM (Sea)</label>
                    <p className="text-gray-900 font-medium">{Number(selectedRoute.min_cbm_sea).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedRoute.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Updated At</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedRoute.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoutes;
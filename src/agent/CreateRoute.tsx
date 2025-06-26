import React, { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapPin, Ship, Plane, Gavel, Warehouse, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Note: Consider wrapping this component in an error boundary to handle runtime errors gracefully.
// See: https://react.dev/link/error-boundaries

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

interface Bid {
  id: number;
  route_id: number;
  mode: 'air' | 'sea';
  base_price: number | string;
  discount_percentage: number;
  is_auto_bid: boolean;
  start_date: string;
  end_date: string;
  route: Route;
}

interface Warehouse {
  id: number;
  agent_id: number;
  agent?: { id: number; name: string };
  address: string;
  type: 'local' | 'international';
}

interface Agent {
  id: number;
  name: string;
}

const CreateRoute = () => {
  const [activeTab, setActiveTab] = useState('create-route');
  const [routeSubTab, setRouteSubTab] = useState('create');
  const [bidSubTab, setBidSubTab] = useState('create');
  const [warehouseSubTab, setWarehouseSubTab] = useState('create');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
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
  const [bidForm, setBidForm] = useState({
    route_id: '',
    mode: 'air',
    base_price: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
  });
  const [warehouseForm, setWarehouseForm] = useState({
    agent_id: '',
    address: '',
    type: 'local',
  });
  const [warehouseUpdateForm, setWarehouseUpdateForm] = useState({
    id: '',
    agent_id: '',
    address: '',
    type: 'local',
  });
  const [deleteWarehouseId, setDeleteWarehouseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAgents = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Agents API response:', data);
      setAgents(Array.isArray(data.agents) ? data.agents : []);
    } catch (err: any) {
      console.error('Fetch agents error:', err.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAgents(retries - 1, delay * 2);
      }
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    }
  }, []);

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
      console.log('Routes API response:', data);
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

  const fetchBids = useCallback(async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/bids', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch bids: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Bids API response:', data);
      if (!Array.isArray(data.bids)) {
        console.warn('Bids data is not an array:', data.bids);
        setBids([]);
      } else {
        setBids(data.bids);
      }
    } catch (err: any) {
      console.error('Fetch bids error:', err.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchBids(retries - 1, delay * 2);
      }
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarehouses = useCallback(async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/warehouses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouses: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Warehouses API response:', data);
      setWarehouses(Array.isArray(data.warehouses) ? data.warehouses : []);
    } catch (err: any) {
      console.error('Fetch warehouses error:', err.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWarehouses(retries - 1, delay * 2);
      }
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in to continue.');
      toast.error('Authentication required. Redirecting to login.', { position: 'top-right', autoClose: 3000 });
      navigate('/login');
      return;
    }

    if (activeTab === 'bids' || activeTab === 'create-route') {
      fetchRoutes();
    }
    if (activeTab === 'bids') {
      fetchBids();
    }
    if (activeTab === 'warehouse') {
      fetchWarehouses();
      fetchAgents();
    }
  }, [activeTab, fetchRoutes, fetchBids, fetchWarehouses, fetchAgents, navigate]);

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

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      const now = new Date();
      const startDate = new Date(bidForm.start_date);
      if (startDate <= now) {
        throw new Error('Start date must be in the future');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          route_id: parseInt(bidForm.route_id),
          mode: bidForm.mode,
          base_price: parseFloat(bidForm.base_price),
          discount_percentage: parseFloat(bidForm.discount_percentage),
          start_date: startDate.toISOString(),
          end_date: new Date(bidForm.end_date).toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create bid');
      }
      setBids([data.bid, ...bids]);
      setBidForm({
        route_id: '',
        mode: 'air',
        base_price: '',
        discount_percentage: '',
        start_date: '',
        end_date: '',
      });
      toast.success('Bid created successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          agent_id: parseInt(warehouseForm.agent_id),
          address: warehouseForm.address,
          type: warehouseForm.type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create warehouse');
      }
      setWarehouses([...warehouses, data.warehouse]);
      setWarehouseForm({ agent_id: '', address: '', type: 'local' });
      toast.success('Warehouse created successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch(`http://127.0.0.1:8000/api/warehouses/${warehouseUpdateForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          agent_id: parseInt(warehouseUpdateForm.agent_id),
          address: warehouseUpdateForm.address,
          type: warehouseUpdateForm.type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to update warehouse: ${response.status}`);
      }
      setWarehouses(warehouses.map(w => w.id === parseInt(warehouseUpdateForm.id) ? data.warehouse : w));
      setWarehouseUpdateForm({ id: '', agent_id: '', address: '', type: 'local' });
      toast.success('Warehouse updated successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch(`http://127.0.0.1:8000/api/warehouses/${deleteWarehouseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete warehouse');
      }
      setWarehouses(warehouses.filter(w => w.id !== parseInt(deleteWarehouseId)));
      setDeleteWarehouseId('');
      toast.success('Warehouse deleted successfully!', { position: 'top-right', autoClose: 3000 });
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

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBidForm({ ...bidForm, [e.target.name]: e.target.value });
  };

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWarehouseForm({ ...warehouseForm, [e.target.name]: e.target.value });
  };

  const handleWarehouseUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWarehouseUpdateForm({ ...warehouseUpdateForm, [e.target.name]: e.target.value });
  };

  const formatPrice = (price: number | string | null): string => {
    if (price === null) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 'N/A' : `$${numPrice.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 flex py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="relative flex w-full max-w-7xl mx-auto">
        <div className="w-64 bg-white/80 backdrop-blur-sm rounded-l-3xl shadow-lg p-6 flex flex-col space-y-4">
          <button
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-transform duration-300 transform hover:scale-105 ${
              activeTab === 'create-route' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600'
            }`}
            onClick={() => setActiveTab('create-route')}
          >
            <MapPin className="w-5 h-5" />
            <span>Routes</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-transform duration-300 transform hover:scale-105 ${
              activeTab === 'bids' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600'
            }`}
            onClick={() => setActiveTab('bids')}
          >
            <Gavel className="w-5 h-5" />
            <span>Bids</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-transform duration-300 transform hover:scale-105 ${
              activeTab === 'warehouse' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600'
            }`}
            onClick={() => setActiveTab('warehouse')}
          >
            <Warehouse className="w-5 h-5" />
            <span>Warehouse</span>
          </button>
        </div>

        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-r-3xl shadow-lg p-8">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</div>
          )}

          {activeTab === 'create-route' && (
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
                      <Ship className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                      <Plane className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              From
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              To
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Sea Price ($/CBM)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Air Price ($/KG)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Min Air (KG)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Min Sea (CBM)
                            </th>
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
                              <td className="px-4 py-3 text-sm text-gray-900">{route.min_kg_air.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{route.min_cbm_sea.toFixed(2)}</td>
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
                      <Ship className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                      <Plane className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
          )}

          {activeTab === 'bids' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bids</h2>
              <div className="flex border-b border-gray-200 mb-6 relative">
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    bidSubTab === 'create' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
                  }`}
                  onClick={() => setBidSubTab('create')}
                >
                  Create Bid
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    bidSubTab === 'view' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
                  }`}
                  onClick={() => setBidSubTab('view')}
                >
                  View Bids
                </button>
                <span
                  className="absolute bottom-0 h-0.5 bg-teal-600 transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
                  style={{
                    width: `${100 / 2}%`,
                    left: `${(['create', 'view'].indexOf(bidSubTab) * 100) / 2}%`,
                  }}
                />
              </div>
              {bidSubTab === 'create' && (
                <form onSubmit={handleBidSubmit} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        name="route_id"
                        value={bidForm.route_id}
                        onChange={handleBidChange}
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                    <div className="relative">
                      {bidForm.mode === 'air' ? (
                        <Plane className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      ) : (
                        <Ship className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      )}
                      <select
                        name="mode"
                        value={bidForm.mode}
                        onChange={handleBidChange}
                        className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                        required
                        disabled={loading}
                      >
                        <option value="air">Air Freight</option>
                        <option value="sea">Sea Freight</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($ per KG/CBM)</label>
                    <input
                      type="number"
                      name="base_price"
                      value={bidForm.base_price}
                      onChange={handleBidChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      required
                      min="0.01"
                      step="0.01"
                      disabled={loading}
                      placeholder="e.g., 50.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      name="discount_percentage"
                      value={bidForm.discount_percentage}
                      onChange={handleBidChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      disabled={loading}
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={bidForm.start_date}
                      onChange={handleBidChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={bidForm.end_date}
                      onChange={handleBidChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      required
                      min={bidForm.start_date || new Date().toISOString().slice(0, 16)}
                      disabled={loading}
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
                      <span>Create Bid</span>
                    )}
                  </button>
                </form>
              )}
              {bidSubTab === 'view' && (
                <div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                      <span className="ml-2 text-gray-600">Loading bids...</span>
                    </div>
                  ) : bids.length === 0 ? (
                    <div className="text-center py-12">
                      <Gavel className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-600 mt-4">No bids found.</p>
                      <p className="text-gray-500 text-sm mt-1">Bids will appear here when available.</p>
                      <button
                        onClick={() => fetchBids()}
                        className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all"
                      >
                        Retry Fetching Bids
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-teal-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Route
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Mode
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Base Price ($)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Discount (%)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Start Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              End Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Auto Bid
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {bids.map(bid => (
                            <tr key={bid.id} className="hover:bg-teal-25">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {bid.route ? (
                                  `${bid.route.from_location} → ${bid.route.to_location}`
                                ) : (
                                  <span className="text-gray-400">Route unavailable</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{bid.mode}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {formatPrice(bid.base_price)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{bid.discount_percentage}%</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(bid.start_date).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(bid.end_date).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {bid.is_auto_bid ? 'Yes' : 'No'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'warehouse' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Warehouse Management</h2>
              <div className="flex border-b border-gray-200 mb-6 relative">
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    warehouseSubTab === 'create' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
                  }`}
                  onClick={() => setWarehouseSubTab('create')}
                >
                  Create Warehouse
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    warehouseSubTab === 'view' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
                  }`}
                  onClick={() => setWarehouseSubTab('view')}
                >
                  View Warehouses
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    warehouseSubTab === 'update' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
                  }`}
                  onClick={() => setWarehouseSubTab('update')}
                >
                  Update Warehouse
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    warehouseSubTab === 'delete' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
                  }`}
                  onClick={() => setWarehouseSubTab('delete')}
                >
                  Delete Warehouse
                </button>
                <span
                  className="absolute bottom-0 h-0.5 bg-teal-600 transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
                  style={{
                    width: `${100 / 4}%`,
                    left: `${(['create', 'view', 'update', 'delete'].indexOf(warehouseSubTab) * 100) / 4}%`,
                  }}
                />
              </div>
              {warehouseSubTab === 'create' && (
                <form onSubmit={handleWarehouseSubmit} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                    <select
                      name="agent_id"
                      value={warehouseForm.agent_id}
                      onChange={handleWarehouseChange}
                      required
                      disabled={loading || agents.length === 0}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value="">Select Agent</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    {agents.length === 0 && !loading && (
                      <p className="text-sm text-red-600 mt-1">No agents available. Please try again later.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={warehouseForm.address}
                      onChange={handleWarehouseChange}
                      required
                      disabled={loading}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      placeholder="e.g., 123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      value={warehouseForm.type}
                      onChange={handleWarehouseChange}
                      required
                      disabled={loading}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value="local">Local</option>
                      <option value="international">International</option>
                    </select>
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
                      <span>Create Warehouse</span>
                    )}
                  </button>
                </form>
              )}
              {warehouseSubTab === 'view' && (
                <div>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                      <span className="ml-2 text-gray-600">Loading warehouses...</span>
                    </div>
                  ) : warehouses.length === 0 ? (
                    <div className="text-center py-12">
                      <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-600 mt-4">No warehouses found.</p>
                      <p className="text-gray-500 text-sm mt-1">Warehouses will appear here when available.</p>
                      <button
                        onClick={() => fetchWarehouses()}
                        className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all"
                      >
                        Retry Fetching Warehouses
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-teal-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Agent Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Address
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Type
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {warehouses.map(warehouse => (
                            <tr key={warehouse.id} className="hover:bg-teal-25">
                              <td className="px-4 py-3 text-sm text-gray-900">{warehouse.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {warehouse.agent?.name || 'Unknown'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{warehouse.address}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{warehouse.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {warehouseSubTab === 'update' && (
                <form onSubmit={handleWarehouseUpdate} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                    <select
                      name="id"
                      value={warehouseUpdateForm.id}
                      onChange={handleWarehouseUpdateChange}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      required
                      disabled={loading}
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          ID: {warehouse.id} (Agent: {warehouse.agent?.name || warehouse.agent_id}, {warehouse.address})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
                    <select
                      name="agent_id"
                      value={warehouseUpdateForm.agent_id}
                      onChange={handleWarehouseUpdateChange}
                      required
                      disabled={loading || agents.length === 0}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value="">Select Agent</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    {agents.length === 0 && !loading && (
                      <p className="text-sm text-red-600 mt-1">No agents available. Please try again later.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={warehouseUpdateForm.address}
                      onChange={handleWarehouseUpdateChange}
                      required
                      disabled={loading}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      placeholder="e.g., 123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="type"
                      value={warehouseUpdateForm.type}
                      onChange={handleWarehouseUpdateChange}
                      required
                      disabled={loading}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                      <option value="local">Local</option>
                      <option value="international">International</option>
                    </select>
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
                      <span>Update Warehouse</span>
                    )}
                  </button>
                </form>
              )}
              {warehouseSubTab === 'delete' && (
                <form onSubmit={handleWarehouseDelete} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                    <select
                      value={deleteWarehouseId}
                      onChange={e => setDeleteWarehouseId(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                      required
                      disabled={loading}
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          ID: {warehouse.id} (Agent: {warehouse.agent?.name || warehouse.agent_id}, {warehouse.address})
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
                      <span>Delete Warehouse</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRoute;

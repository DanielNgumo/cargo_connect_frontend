import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Loader2, Gavel, MapPin, Ship, Plane, Calendar, Eye, Trash2 } from 'lucide-react';

interface Route {
  id: number;
  from_location: string;
  to_location: string;
}

interface BidOpportunity {
  id: number;
  route_id: number;
  mode: 'air' | 'sea';
  base_volume: number;
  discount_start: number;
  discount_cap: number;
  offer_duration: number;
  frequency: number;
  start_date: string;
  end_date: string;
  status: 'open' | 'upcoming' | 'closed';
  route: Route;
}

interface Bid {
  id: number;
  agent_id: number;
  bid_opportunity_id: number;
  mode: 'air' | 'sea';
  base_price: number;
  discount_percentage: number;
  is_auto_bid: boolean;
  created_at: string;
  status: string;
  start_date: string;
  end_date: string;
  route: Route | null;
}

const Bids: React.FC = () => {
  const [formData, setFormData] = useState({
    route_id: '',
    mode: 'sea',
    base_volume: '0.1',
    discount_start: '0.2',
    discount_cap: '10',
    offer_duration: '30',
    frequency: '30',
    start_date: '',
    end_date: '',
    status: 'open' as 'open' | 'upcoming',
  });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bidOpportunities, setBidOpportunities] = useState<BidOpportunity[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedBidOpportunityId, setSelectedBidOpportunityId] = useState<number | null>(null);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');

  // Get current date in YYYY-MM-DD format
  const getToday = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10); // e.g., 2025-06-26
  };

  // Get current date and time in ISO format for min attribute
  const getCurrentTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // e.g., 2025-06-26T18:02
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const routesResponse = await fetch('/api/shipping-routes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          credentials: 'include',
        });
        if (!routesResponse.ok) throw new Error('Failed to fetch routes');
        const routesData = await routesResponse.json();
        const routes = routesData.routes || routesData.data || routesData || [];
        setRoutes(Array.isArray(routes) ? routes : []);

        await refreshBidOpportunities();
      } catch (err: any) {
        setError(err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
          position: 'top-end',
          timer: 5000,
          showConfirmButton: false,
          toast: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshBidOpportunities = async (retryCount = 0, maxRetries = 2) => {
    try {
      const response = await fetch(`/api/admin/bids?t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to fetch bids: HTTP ${response.status}`);
      const data = await response.json();
      const bids = data.bid_opportunities || data.bids || [];
      console.log('Fetched bid opportunities:', {
        count: bids.length,
        bids: bids.map((b: BidOpportunity) => ({
          id: b.id,
          status: b.status,
          route_id: b.route_id,
        })),
      });
      setBidOpportunities(bids);
    } catch (err: any) {
      console.error('Failed to refresh bids:', err.message);
      if (retryCount < maxRetries) {
        console.log(`Retrying fetch bids (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => refreshBidOpportunities(retryCount + 1, maxRetries), 1000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to refresh bid opportunities',
          position: 'top-end',
          timer: 5000,
          showConfirmButton: false,
          toast: true,
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'start_date' && formData.status === 'open') {
      const selectedDate = new Date(value);
      const today = new Date(getToday());
      if (selectedDate > today) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Date',
          text: 'Open dates must start from today',
          position: 'top-end',
          timer: 5000,
          showConfirmButton: false,
          toast: true,
        });
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as 'open' | 'upcoming';
    const startDate = status === 'open' ? getToday() : formData.start_date;
    setFormData(prev => ({
      ...prev,
      status,
      start_date: startDate,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const now = new Date();
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date(getToday());

    // Validate status-date relationship
    if (formData.status === 'upcoming' && startDate <= now) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Upcoming bids require a future start date',
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false,
        toast: true,
      });
      setLoading(false);
      return;
    }

    if (formData.status === 'open' && startDate > today) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date',
        text: 'Open bids require current/past start date',
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false,
        toast: true,
      });
      setLoading(false);
      return;
    }

    try {
      if (!formData.route_id) throw new Error('Please select a route');
      if (parseFloat(formData.base_volume) <= 0) throw new Error('Base volume/weight must be positive');
      if (parseFloat(formData.discount_start) <= parseFloat(formData.base_volume))
        throw new Error('Discount start must be greater than base volume/weight');
      if (parseFloat(formData.discount_cap) <= parseFloat(formData.discount_start))
        throw new Error('Discount cap must be greater than discount start');
      if (parseInt(formData.offer_duration) <= 0) throw new Error('Offer duration must be positive');
      if (parseInt(formData.frequency) <= 0) throw new Error('Frequency must be positive');
      if (!formData.start_date) throw new Error('Please select a start date');
      if (!formData.end_date) throw new Error('Please select an end date');
      if (endDate <= startDate) throw new Error('End date must be after start date');
      if (!formData.status) throw new Error('Please select a status');

      const response = await fetch('/api/admin/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          route_id: parseInt(formData.route_id),
          mode: formData.mode,
          base_volume: parseFloat(formData.base_volume),
          discount_start: parseFloat(formData.discount_start),
          discount_cap: parseFloat(formData.discount_cap),
          offer_duration: parseInt(formData.offer_duration),
          frequency: parseInt(formData.frequency),
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: formData.status,
        }),
      });
      const data = await response.json();
      console.log('POST response data:', {
        bid_id: data.bid_opportunity?.id,
        status: data.bid_opportunity?.status,
        route_id: data.bid_opportunity?.route_id,
      });
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          throw new Error(errorMessages || 'Failed to create bid opportunity');
        }
        throw new Error(data.message || 'Failed to create bid opportunity');
      }

      setFormData({
        route_id: '',
        mode: 'sea',
        base_volume: '0.1',
        discount_start: '0.2',
        discount_cap: '10',
        offer_duration: '30',
        frequency: '30',
        start_date: '',
        end_date: '',
        status: 'open',
      });
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Bid opportunity created successfully!',
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
      });
      await refreshBidOpportunities();
      setActiveTab('view');
    } catch (err: any) {
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false,
        toast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the bid opportunity!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#f87171',
      confirmButtonText: 'Yes, delete it!',
      position: 'center',
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/bids/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete bid opportunity');
        }
        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Bid opportunity deleted successfully!',
          position: 'top-end',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
        });
        await refreshBidOpportunities();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
          position: 'top-end',
          timer: 5000,
          showConfirmButton: false,
          toast: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewBids = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/bids/${id}/bids`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch bids');
      }
      const data = await response.json();
      setBids(data.bids || []);
      setSelectedBidOpportunityId(id);
      setShowBidsModal(true);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        position: 'top-end',
        timer: 5000,
        showConfirmButton: false,
        toast: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const closeBidsModal = () => {
    setShowBidsModal(false);
    setSelectedBidOpportunityId(null);
    setBids([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-teal-700">Manage Bids</h2>
          <p className="text-sm text-teal-600 mt-1">Create and monitor bid opportunities</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-teal-200">
          <nav className="flex space-x-6 px-4 py-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'create'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-teal-500 hover:text-teal-700'
              }`}
            >
              Create Bid
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'view'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-teal-500 hover:text-teal-700'
              }`}
            >
              View Bids
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'create' && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 font-medium p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <h3 className="text-xl font-semibold text-teal-700 mb-4">Create New Bid Opportunity</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">Route</label>
                  <MapPin className="w-5 h-5 text-teal-400 absolute left-3 top-10" />
                  <select
                    name="route_id"
                    value={formData.route_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Route</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.from_location} → {route.to_location}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">Mode</label>
                  {formData.mode === 'sea' ? (
                    <Ship className="w-5 h-5 text-teal-400 absolute left-3 top-10" />
                  ) : (
                    <Plane className="w-5 h-5 text-teal-400 absolute left-3 top-10" />
                  )}
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    disabled={loading}
                  >
                    <option value="sea">Sea</option>
                    <option value="air">Air</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleStatusChange}
                    className="w-full pl-4 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    required
                    disabled={loading}
                  >
                    <option value="open">Open</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Base {formData.mode === 'sea' ? 'Volume (CBM)' : 'Weight (KG)'}
                  </label>
                  <input
                    type="number"
                    name="base_volume"
                    step="0.01"
                    value={formData.base_volume}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    placeholder={formData.mode === 'sea' ? 'e.g., 0.1' : 'e.g., 1'}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Discount Start {formData.mode === 'sea' ? 'Volume (CBM)' : 'Weight (KG)'}
                  </label>
                  <input
                    type="number"
                    name="discount_start"
                    step="0.01"
                    value={formData.discount_start}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    placeholder={formData.mode === 'sea' ? 'e.g., 0.2' : 'e.g., 2'}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">
                    Discount Cap {formData.mode === 'sea' ? 'Volume (CBM)' : 'Weight (KG)'}
                  </label>
                  <input
                    type="number"
                    name="discount_cap"
                    step="0.01"
                    value={formData.discount_cap}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    placeholder={formData.mode === 'sea' ? 'e.g., 10' : 'e.g., 100'}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">Offer Duration (Days)</label>
                  <input
                    type="number"
                    name="offer_duration"
                    value={formData.offer_duration}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">Frequency (Days)</label>
                  <input
                    type="number"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">Start Date</label>
                  <Calendar className="w-5 h-5 text-teal-400 absolute left-3 top-10" />
                  <input
                    type={formData.status === 'open' ? 'date' : 'datetime-local'}
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min={formData.status === 'upcoming' ? getCurrentTime() : undefined}
                    max={formData.status === 'open' ? getToday() : undefined}
                    className="w-full pl-10 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-teal-700 mb-2">End Date</label>
                  <Calendar className="w-5 h-5 text-teal-400 absolute left-3 top-10" />
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min={formData.start_date || getCurrentTime()}
                    className="w-full pl-10 pr-4 py-2 border border-teal-200 rounded-md bg-teal-50 text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all disabled:opacity-50 hover:bg-teal-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-6 py-2 rounded-md font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
                      loading
                        ? 'bg-teal-300 text-teal-600 cursor-not-allowed'
                        : 'bg-teal-600 text-white hover:bg-teal-700 hover-shadow-md'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span>Creating...</span>
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <Gavel className="w-5 h-5" />
                        <span>Create Bid</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'view' && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 font-medium p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <h3 className="text-xl font-semibold text-teal-700">Bid Opportunities</h3>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  <span className="ml-2 text-teal-600">Loading bids...</span>
                </div>
              ) : bidOpportunities.length === 0 ? (
                <div className="text-center py-6">
                  <Gavel className="mx-auto h-12 w-12 text-teal-400" />
                  <p className="text-teal-600 mt-2">No bid opportunities found.</p>
                  <p className="text-teal-500 text-sm mt-1">Create a bid to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-teal-200">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Route</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Mode</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Base Volume</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Discount Start</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Discount Cap</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Duration</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-100">
                      {bidOpportunities.map((bid) => (
                        <tr key={bid.id} className="hover:bg-teal-50 transition-colors">
                          <td className="px-4 py-2 text-sm text-teal-800">
                            {bid.route.from_location} → {bid.route.to_location}
                          </td>
                          <td className="px-4 py-2 text-sm text-teal-800">{bid.mode}</td>
                          <td className="px-4 py-2 text-sm text-teal-800">
                            {bid.base_volume} {bid.mode === 'sea' ? 'CBM' : 'KG'}
                          </td>
                          <td className="px-4 py-2 text-sm text-teal-800">
                            {bid.discount_start} {bid.mode === 'sea' ? 'CBM' : 'KG'}
                          </td>
                          <td className="px-4 py-2 text-sm text-teal-800">
                            {bid.discount_cap} {bid.mode === 'sea' ? 'CBM' : 'KG'}
                          </td>
                          <td className="px-4 py-2 text-sm text-teal-800">{bid.offer_duration} days</td>
                          <td className="px-4 py-2 text-sm text-teal-800">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                bid.status === 'open'
                                  ? 'bg-green-100 text-green-700'
                                  : bid.status === 'upcoming'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {bid.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-teal-800">
                            <button
                              onClick={() => handleViewBids(bid.id)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                              disabled={loading}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(bid.id)}
                              className="text-red-500 hover:text-red-700"
                              disabled={loading}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
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
      </div>

      {showBidsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-teal-700">Bids for Opportunity #{selectedBidOpportunityId}</h3>
              <button
                onClick={closeBidsModal}
                className="text-teal-600 hover:text-teal-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {bids.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-teal-600">No bids found for this opportunity.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-teal-200">
                  <thead className="bg-teal-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Agent ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Mode</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Base Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Discount %</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Auto Bid</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-100">
                    {bids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-teal-50 transition-colors">
                        <td className="px-4 py-2 text-sm text-teal-800">{bid.agent_id}</td>
                        <td className="px-4 py-2 text-sm text-teal-800">{bid.mode}</td>
                        <td className="px-4 py-2 text-sm text-teal-800">{bid.base_price}</td>
                        <td className="px-4 py-2 text-sm text-teal-800">{bid.discount_percentage}%</td>
                        <td className="px-4 py-2 text-sm text-teal-800">{bid.is_auto_bid ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 text-sm text-teal-800">
                          {new Date(bid.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bids;
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');

  // Get current time in ISO format for min attribute
  const getCurrentTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
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
        toast.error(err.message, { position: 'top-right', autoClose: 5000 });
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
        toast.error('Failed to refresh bid opportunities', { position: 'top-right', autoClose: 5000 });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as 'open' | 'upcoming';
    const now = new Date().toISOString().slice(0, 16);
    
    setFormData(prev => ({
      ...prev,
      status,
      start_date: status === 'open' ? now : prev.start_date
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const now = new Date();
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    // Validate status-date relationship
    if (formData.status === 'upcoming' && startDate <= now) {
      toast.error('Upcoming bids require a future start date', { position: 'top-right', autoClose: 5000 });
      setLoading(false);
      return;
    }
    
    if (formData.status === 'open' && startDate > now) {
      toast.error('Open bids require current/past start date', { position: 'top-right', autoClose: 5000 });
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
      if (new Date(formData.end_date) <= new Date(formData.start_date))
        throw new Error('End date must be after start date');
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
      toast.success('Bid opportunity created successfully!', { position: 'top-right', autoClose: 3000 });
      await refreshBidOpportunities();
      setActiveTab('view');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
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
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    min={formData.status === 'open' ? undefined : getCurrentTime()}
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
                            <button className="text-blue-500 hover:text-blue-700 mr-2">
                              <Eye className="w-5 h-5" />
                            </button>
                            <button className="text-red-500 hover:text-red-700">
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
    </div>
  );
};

export default Bids;
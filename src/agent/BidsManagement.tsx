import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Gavel, MapPin, Plane, Ship, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Route {
  id: number;
  from_location: string;
  to_location: string;
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

interface BidsManagementProps {
  routes: Route[];
}

const BidsManagement: React.FC<BidsManagementProps> = ({ routes }) => {
  const [bidSubTab, setBidSubTab] = useState('create');
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidForm, setBidForm] = useState({
    route_id: '',
    mode: 'air',
    base_price: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

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

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBidForm({ ...bidForm, [e.target.name]: e.target.value });
  };

  const formatPrice = (price: number | string | null): string => {
    if (price === null) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 'N/A' : `$${numPrice.toFixed(2)}`;
  };

  return (
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
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</div>
      )}
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
  );
};

export default BidsManagement;
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Ship, Plane, Clock, Wallet, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface Route {
  id: number;
  from_location: string;
  to_location: string;
}

interface Bid {
  id: number;
  bid_opportunity_id: number;
  route: Route | null;
  mode: 'air' | 'sea';
  base_price: number | string | null;
  discount_percentage: number | string | null;
  status: 'open' | 'upcoming' | 'closed';
  start_date?: string;
  end_date?: string;
  is_auto_bid: boolean;
}

interface BidOpportunity {
  id: number;
  route_id: number;
  route: Route | null;
  mode: 'air' | 'sea';
  base_volume: number;
  discount_start: number;
  discount_cap: number;
  offer_duration: number;
  frequency: number;
  status: 'open' | 'upcoming' | 'closed';
  start_date: string;
  end_date: string;
}

const GoldPlan: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'upcoming'>('open');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [bidOpportunities, setBidOpportunities] = useState<BidOpportunity[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [formData, setFormData] = useState({
    bid_opportunity_id: '',
    mode: 'sea' as 'air' | 'sea',
    base_price: '',
    discount_percentage: '',
    is_auto_bid: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'air' | 'sea'>('all');

  useEffect(() => {
    fetchBids();
    fetchWalletBalance();
    fetchBidOpportunities();
  }, []);

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');
      const response = await fetch('/api/gold-plan/bids', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch bids: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      console.log('Raw bids response:', data);
      const validBids = (data.bids || []).filter((bid: Bid) => {
        if (bid.status === 'closed' || bid.base_price == null || bid.discount_percentage == null) {
          console.warn('Invalid bid filtered out:', bid);
          return false;
        }
        return true;
      }).map((bid: Bid) => ({
        ...bid,
        base_price: typeof bid.base_price === 'string' ? parseFloat(bid.base_price) : bid.base_price,
        discount_percentage: typeof bid.discount_percentage === 'string' ? parseFloat(bid.discount_percentage) : bid.discount_percentage,
      })).sort((a: { status: string; start_date?: string }, b: { status: string; start_date?: string }) => {
        if (a.status === 'upcoming' && b.status === 'upcoming' && a.start_date && b.start_date) {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        }
        return 0;
      });
      setBids(validBids);
      console.log('Valid bids:', validBids);
    } catch (err: any) {
      console.error('Fetch bids error:', err);
      toast.error(err.message, { position: 'top-right', autoClose: 3000 });
      setError('Failed to load bids. Please try again.');
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');
      const response = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch user data: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      setWalletBalance(data.wallet_balance != null ? data.wallet_balance : 0);
      console.log('Wallet balance:', data.wallet_balance);
    } catch (err: any) {
      console.error('Fetch wallet balance error:', err);
      toast.error(err.message, { position: 'top-right', autoClose: 3000 });
      setError('Failed to load wallet balance. Please try again.');
    }
  };

  const fetchBidOpportunities = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');
      const response = await fetch('/api/gold-plan', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to fetch bid opportunities: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      console.log('Raw bid opportunities response:', data);
      const validOpportunities = (data.bid_opportunities || []).filter((opp: BidOpportunity) => {
        if (!opp.route || !opp.route.from_location || !opp.route.to_location) {
          console.warn('Invalid bid opportunity filtered out:', opp);
          return false;
        }
        return true;
      });
      setBidOpportunities(validOpportunities);
      console.log('Valid bid opportunities:', validOpportunities);
    } catch (err: any) {
      console.error('Fetch bid opportunities error:', err);
      toast.error(err.message, { position: 'top-right', autoClose: 3000 });
      setError('Failed to load bid opportunities. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = () => {
    const basePrice = parseFloat(formData.base_price);
    const discountPercentage = parseFloat(formData.discount_percentage);
    if (!formData.bid_opportunity_id) {
      toast.error('Please select a bid opportunity.', { position: 'top-right', autoClose: 3000 });
      return false;
    }
    if (isNaN(basePrice) || basePrice <= 0) {
      toast.error('Base price must be a positive number.', { position: 'top-right', autoClose: 3000 });
      return false;
    }
    if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
      toast.error('Discount percentage must be between 0 and 100.', { position: 'top-right', autoClose: 3000 });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');
      const selectedOpp = bidOpportunities.find(opp => opp.id === parseInt(formData.bid_opportunity_id));
      if (!selectedOpp) throw new Error('Invalid bid opportunity selected');
      const payload = {
        bid_opportunity_id: parseInt(formData.bid_opportunity_id),
        mode: selectedOpp.mode,
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseFloat(formData.discount_percentage),
        is_auto_bid: formData.is_auto_bid,
      };
      const response = await fetch('/api/gold-plan/bids', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit bid');
      }
      const data = await response.json();
      const newBid = {
        ...data.bid,
        base_price: parseFloat(data.bid.base_price),
        discount_percentage: parseFloat(data.bid.discount_percentage),
        route: selectedOpp.route,
        status: selectedOpp.status,
        start_date: selectedOpp.start_date,
        end_date: selectedOpp.end_date,
      };
      setBids([newBid, ...bids].sort((a, b) => {
        if (a.status === 'upcoming' && b.status === 'upcoming' && a.start_date && b.start_date) {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        }
        return 0;
      }));
      setFormData({ bid_opportunity_id: '', mode: 'sea', base_price: '', discount_percentage: '', is_auto_bid: false });
      toast.success(data.message, { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      console.error('Error submitting bid:', err);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    }
  };

  const handleEdit = (bid: Bid) => {
    setEditingBid(bid);
    setFormData({
      bid_opportunity_id: bid.bid_opportunity_id?.toString() || '',
      mode: bid.mode,
      base_price: bid.base_price?.toString() || '',
      discount_percentage: bid.discount_percentage?.toString() || '',
      is_auto_bid: bid.is_auto_bid,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingBid) return;

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseFloat(formData.discount_percentage),
        is_auto_bid: formData.is_auto_bid,
      };
      const response = await fetch(`/api/gold-plan/bids/${editingBid.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update bid');
      }
      const data = await response.json();
      const updatedBid = {
        ...data.bid,
        base_price: parseFloat(data.bid.base_price),
        discount_percentage: parseFloat(data.bid.discount_percentage),
      };
      setBids(bids.map(b => b.id === editingBid.id ? updatedBid : b).sort((a, b) => {
        if (a.status === 'upcoming' && b.status === 'upcoming' && a.start_date && b.start_date) {
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        }
        return 0;
      }));
      setEditingBid(null);
      setFormData({ bid_opportunity_id: '', mode: 'sea', base_price: '', discount_percentage: '', is_auto_bid: false });
      toast.success('Bid updated successfully', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      console.error('Error updating bid:', err);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    }
  };

  const handleLoadMoney = async () => {
    const amount = window.prompt('Enter amount to load into wallet:');
    if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/gold-plan/wallet/load', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ amount: parseFloat(amount) }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to load wallet');
        }
        const data = await response.json();
        setWalletBalance(data.balance);
        toast.success(data.message, { position: 'top-right', autoClose: 3000 });
      } catch (err: any) {
        console.error('Error loading wallet:', err);
        toast.error(err.message, { position: 'top-right', autoClose: 5000 });
      }
    } else {
      toast.error('Please enter a valid amount.', { position: 'top-right', autoClose: 5000 });
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-2xl font-bold">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchBids();
            fetchWalletBalance();
            fetchBidOpportunities();
          }}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredBids = bids.filter(bid => bid.status === activeTab).filter(bid => filterMode === 'all' || bid.mode === filterMode);
  const filteredOpportunities = activeTab === 'upcoming'
    ? bidOpportunities.filter(opp => opp.status === 'upcoming').filter(opp => filterMode === 'all' || opp.mode === filterMode)
    : [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-teal-700">Gold Plan</h2>
      <p className="text-teal-600">Manage your bids and participate in aggregation campaigns.</p>

      {/* Wallet Section */}
      <div className="bg-teal-50 p-4 rounded-lg shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-teal-600" />
          <span className="text-teal-800 font-medium">
            Wallet Balance: {walletBalance != null ? `$${walletBalance.toFixed(2)}` : 'Loading...'}
          </span>
        </div>
        <button
          onClick={handleLoadMoney}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          Load Money
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-teal-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'open' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-teal-500 hover:text-teal-700'
            }`}
          >
            Open Bids
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'upcoming' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-teal-500 hover:text-teal-700'
            }`}
          >
            Upcoming Bids
          </button>
        </nav>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-teal-700">Filter by Mode:</label>
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value as 'all' | 'air' | 'sea')}
          className="p-2 border border-teal-200 rounded-md bg-white text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All</option>
          <option value="air">Air</option>
          <option value="sea">Sea</option>
        </select>
      </div>

      {/* Bid List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-teal-200">
          <thead className="bg-teal-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Route</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Mode</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">{activeTab === 'open' ? 'Base Price' : 'Base Volume'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">{activeTab === 'open' ? 'Discount %' : 'Discount Start'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">{activeTab === 'open' ? 'Auto Bidding' : 'Offer Duration'}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-100">
            {activeTab === 'open' ? (
              filteredBids.map(bid => (
                <tr key={bid.id} className="hover:bg-teal-50 transition-colors">
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {bid.route ? `${bid.route.from_location} → ${bid.route.to_location}` : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {bid.mode === 'sea' ? <Ship className="w-5 h-5 inline" /> : <Plane className="w-5 h-5 inline" />}
                    {bid.mode}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {typeof bid.base_price === 'number' && !isNaN(bid.base_price)
                      ? `$${bid.base_price.toFixed(2)}/${bid.mode === 'sea' ? 'CBM' : 'KG'}`
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {typeof bid.discount_percentage === 'number' && !isNaN(bid.discount_percentage)
                      ? `${bid.discount_percentage}%`
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">{bid.status}</td>
                  <td className="px-4 py-2 text-sm text-teal-800">{bid.is_auto_bid ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      onClick={() => handleEdit(bid)}
                      disabled={bid.status !== 'upcoming'}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              filteredOpportunities.map(opp => (
                <tr key={opp.id} className="hover:bg-teal-50 transition-colors">
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {opp.route ? `${opp.route.from_location} → ${opp.route.to_location}` : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {opp.mode === 'sea' ? <Ship className="w-5 h-5 inline" /> : <Plane className="w-5 h-5 inline" />}
                    {opp.mode}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {opp.base_volume} {opp.mode === 'sea' ? 'CBM' : 'KG'}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    {opp.discount_start} {opp.mode === 'sea' ? 'CBM' : 'KG'}
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-teal-600" />
                      Opens in {formatDistanceToNow(new Date(opp.start_date), { addSuffix: true })}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-teal-800">{opp.offer_duration} days</td>
                  <td className="px-4 py-2 text-sm text-teal-800">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      onClick={() => setFormData({ ...formData, bid_opportunity_id: opp.id.toString(), mode: opp.mode })}
                    >
                      Bid Now
                    </button>
                  </td>
                </tr>
              ))
            )}
            {(activeTab === 'open' ? filteredBids.length === 0 : filteredOpportunities.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-2 text-sm text-teal-800 text-center">
                  No {activeTab} bids available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bid Submission Form */}
      <div className="bg-teal-50 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-teal-700 mb-4">{editingBid ? 'Edit Bid' : 'Submit New Bid'}</h3>
        <form onSubmit={editingBid ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Bid Opportunity</label>
            <select
              name="bid_opportunity_id"
              value={formData.bid_opportunity_id}
              onChange={handleChange}
              className="w-full p-2 border border-teal-200 rounded-md bg-white text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              disabled={!!editingBid}
            >
              <option value="">Select Bid Opportunity</option>
              {bidOpportunities
                .filter(opp => opp.status === 'open' || opp.status === 'upcoming')
                .map(opp => (
                  <option key={opp.id} value={opp.id}>
                    {opp.route ? `${opp.route.from_location} → ${opp.route.to_location} (${opp.mode}, ${opp.status})` : 'N/A'}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Mode</label>
            <select
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="w-full p-2 border border-teal-200 rounded-md bg-white text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
              disabled={!!editingBid}
            >
              <option value="sea">Sea</option>
              <option value="air">Air</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Base Price</label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border border-teal-200 rounded-md bg-white text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder={formData.mode === 'sea' ? 'e.g., 50/CBM' : 'e.g., 10/KG'}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-teal-700 mb-1">Discount %</label>
            <input
              type="number"
              name="discount_percentage"
              value={formData.discount_percentage}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="100"
              className="w-full p-2 border border-teal-200 rounded-md bg-white text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., 10"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center text-sm font-medium text-teal-700 mb-1">
              <input
                type="checkbox"
                name="is_auto_bid"
                checked={formData.is_auto_bid}
                onChange={handleChange}
                className="mr-2"
              />
              Enable Auto Bidding
              <span className="relative group ml-2">
                <Info className="w-4 h-4 text-teal-600" />
                <span className="absolute hidden group-hover:block bg-teal-800 text-white text-xs rounded p-2 -top-10 left-0 w-48">
                  Auto-bidding uses your most recent bid rates for this route and mode.
                </span>
              </span>
            </label>
            <button
              type="submit"
              className="w-full mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              {editingBid ? 'Update Bid' : 'Submit Bid'}
            </button>
            {editingBid && (
              <button
                type="button"
                onClick={() => {
                  setEditingBid(null);
                  setFormData({ bid_opportunity_id: '', mode: 'sea', base_price: '', discount_percentage: '', is_auto_bid: false });
                }}
                className="w-full mt-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoldPlan;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Route {
  id: number;
  from_location: string;
  to_location: string;
}

interface Bid {
  id: number;
  route_id: number;
  mode: 'air' | 'sea';
  base_price: number;
  discount_percentage: number;
  is_auto_bid: boolean;
  start_date: string;
  end_date: string;
  route: Route;
}

const Bids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [form, setForm] = useState({
    route_id: '',
    mode: 'air',
    base_price: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('Bids token:', { token });
    if (!token) {
      setError('Please log in to view bids');
      navigate('/login');
      return;
    }

    axios.get('/sanctum/csrf-cookie', { withCredentials: true }).then(() => {
      axios.get('/api/bids', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
        .then(response => {
          console.log('Bids response:', response.data);
          setBids(Array.isArray(response.data.bids) ? response.data.bids : []);
        })
        .catch(err => {
          console.error('Bids fetch error:', err.response?.data || err.message);
          setError(err.response?.data?.message || 'Failed to fetch bids');
          setBids([]);
        });

      axios.get('/api/shipping-routes', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
        .then(response => {
          console.log('Routes response:', response.data);
          setRoutes(Array.isArray(response.data.routes) ? response.data.routes : []);
        })
        .catch(err => {
          console.error('Routes fetch error:', err.response?.data || err.message);
          setError(err.response?.data?.message || 'Failed to fetch routes');
        });
    }).catch(err => {
      console.error('CSRF fetch error:', err);
      setError('Failed to initialize');
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('authToken');
    console.log('Submit token:', { token });
    if (!token) {
      setError('Please log in to create a bid');
      navigate('/login');
      return;
    }

    // Log timezone for debugging
    console.log('Client timezone:', {
      localTime: new Date().toString(),
      utcTime: new Date().toISOString(),
      start_date: form.start_date,
    });

    // Validate start_date
    const now = new Date();
    const startDate = new Date(form.start_date);
    if (startDate <= now) {
      setError('Start date must be in the future');
      toast.error('Start date must be in the future', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    const payload = {
      ...form,
      route_id: parseInt(form.route_id),
      base_price: parseFloat(form.base_price),
      discount_percentage: parseFloat(form.discount_percentage),
      start_date: startDate.toISOString(),
      end_date: new Date(form.end_date).toISOString(),
    };

    axios.get('/sanctum/csrf-cookie', { withCredentials: true }).then(() => {
      axios.post('/api/bids', payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })
        .then(response => {
          console.log('Bid created:', response.data);
          setBids([response.data.bid, ...bids]);
          setForm({
            route_id: '',
            mode: 'air',
            base_price: '',
            discount_percentage: '',
            start_date: '',
            end_date: '',
          });
          toast.success('Bid created successfully!', {
            position: 'top-right',
            autoClose: 3000,
          });
        })
        .catch(err => {
          console.error('Bid creation error:', err.response?.data || err.message);
          const validationErrors = err.response?.data?.errors;
          if (validationErrors) {
            const errorMessages = Object.values(validationErrors).flat().join(', ');
            setError(errorMessages);
            toast.error(`Failed to create bid: ${errorMessages}`, {
              position: 'top-right',
              autoClose: 5000,
            });
          } else {
            setError(err.response?.data?.message || 'Failed to create bid');
            toast.error(`Failed to create bid: ${err.response?.data?.message || err.message}`, {
              position: 'top-right',
              autoClose: 5000,
            });
          }
        });
    });
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">My Bids</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Route</label>
            <select
              name="route_id"
              value={form.route_id}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Route</option>
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.from_location} to {route.to_location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Mode</label>
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="air">Air</option>
              <option value="sea">Sea</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Base Price ($ per KG/CBM)</label>
            <input
              type="number"
              name="base_price"
              value={form.base_price}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <label className="block mb-1">Discount Percentage (%)</label>
            <input
              type="number"
              name="discount_percentage"
              value={form.discount_percentage}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <input
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={form.start_date || new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>
        <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">
          Create Bid
        </button>
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4">Route</th>
            <th className="py-2 px-4">Mode</th>
            <th className="py-2 px-4">Base Price ($)</th>
            <th className="py-2 px-4">Discount (%)</th>
            <th className="py-2 px-4">Start Date</th>
            <th className="py-2 px-4">End Date</th>
            <th className="py-2 px-4">Auto Bid</th>
          </tr>
        </thead>
        <tbody>
          {bids && bids.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-2 px-4 text-center">No bids found</td>
            </tr>
          ) : (
            bids?.map(bid => (
              <tr key={bid.id}>
                <td className="py-2 px-4">
                  {bid.route ? `${bid.route.from_location} to ${bid.route.to_location}` : 'N/A'}
                </td>
                <td className="py-2 px-4">{bid.mode}</td>
                <td className="py-2 px-4">{bid.base_price}</td>
                <td className="py-2 px-4">{bid.discount_percentage}</td>
                <td className="py-2 px-4">{new Date(bid.start_date).toLocaleString()}</td>
                <td className="py-2 px-4">{new Date(bid.end_date).toLocaleString()}</td>
                <td className="py-2 px-4">{bid.is_auto_bid ? 'Yes' : 'No'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Bids;
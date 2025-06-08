import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Package, Ship, Plane, MapPin, Loader2, FileText, Gavel, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Route {
  id: number;
  from_location: string;
  to_location: string;
  sea_price_per_cbm: number | null;
  air_price_per_kg: number | null;
  min_kg_air: number;
  min_cbm_sea: number;
  agent_id: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  shipment_id: number;
  amount: number | string | null;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  shipment: {
    id: number;
    mode: 'air' | 'sea';
    estimated_price: number;
    route?: {
      id: number;
      from_location: string;
      to_location: string;
    };
  } | null;
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

const BookShipment = () => {
  const [activeTab, setActiveTab] = useState('book');
  const [prevTab, setPrevTab] = useState('book');
  const [bidSubTab, setBidSubTab] = useState('create'); // 'create' or 'view'
  const [routes, setRoutes] = useState<Route[]>([]);
  const [formData, setFormData] = useState({
    route_id: '',
    mode: 'air',
    weight_kg: '',
    cbm: '',
    warehouse_address: '',
  });
  const [bidForm, setBidForm] = useState({
    route_id: '',
    mode: 'air',
    base_price: '',
    discount_percentage: '',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchingRoutes, setFetchingRoutes] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [discountCodeDetails, setDiscountCodeDetails] = useState<{
    discount_code: string;
    label: string;
    warehouse_address: string;
    invoice_number: string;
    amount: number;
  } | null>(null);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const fetchRoutes = async (retries = 3, delay = 1000) => {
    try {
      setFetchingRoutes(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
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
      setRoutes(data.routes || []);
      console.log('Available route IDs:', data.routes.map((route: Route) => route.id));
    } catch (err: any) {
      console.error('Fetch routes error:', err.message);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchRoutes(retries - 1, delay * 2);
      }
      toast.error(err.message);
      setRoutes([]);
    } finally {
      setFetchingRoutes(false);
      setLoading(false);
    }
  };

  const fetchInvoices = async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      const response = await fetch('http://127.0.0.1:8000/api/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setInvoices(data.invoices || []);
      console.log('Fetched invoices:', data.invoices.map((invoice: Invoice) => invoice.invoice_number));
    } catch (err: any) {
      console.error('Fetch invoices error:', err.message);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchInvoices(retries - 1, delay * 2);
      }
      toast.error(err.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
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
      setBids(Array.isArray(data.bids) ? data.bids : []);
      console.log('Fetched bids:', data.bids);
    } catch (err: any) {
      console.error('Fetch bids error:', err.message);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchBids(retries - 1, delay * 2);
      }
      toast.error(err.message);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'book') fetchRoutes();
    if (activeTab === 'invoices') fetchInvoices();
    if (activeTab === 'bids') fetchBids();
  }, [activeTab]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBidForm({ ...bidForm, [e.target.name]: e.target.value });
  };

  const handleGetDiscountCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      const payload = {
        route_id: parseInt(formData.route_id),
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
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log('Shipment response:', data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create shipment');
      }
      toast.success('Shipment booked successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setDiscountCodeDetails({
        discount_code: data.discount_code,
        label: `Customer Name: ${data.customer_name}, Phone Number: ${data.phone_number}, Destination: ${routes.find(route => route.id === data.shipment.route_id)?.to_location || 'Unknown'}, Mode of Shipping: ${data.shipment.mode}, Discount Code: ${data.discount_code}`,
        warehouse_address: data.shipment.warehouse_address,
        invoice_number: data.invoice.invoice_number,
        amount: data.invoice.amount,
      });
      setFormData({
        route_id: '',
        mode: 'air',
        weight_kg: '',
        cbm: '',
        warehouse_address: '',
      });
    } catch (err: any) {
      console.error('Shipment error:', err.message);
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const now = new Date();
      const startDate = new Date(bidForm.start_date);
      if (startDate <= now) {
        throw new Error('Start date must be in the future');
      }

      const payload = {
        route_id: parseInt(bidForm.route_id),
        mode: bidForm.mode,
        base_price: parseFloat(bidForm.base_price),
        discount_percentage: parseFloat(bidForm.discount_percentage),
        start_date: startDate.toISOString(),
        end_date: new Date(bidForm.end_date).toISOString(),
      };

      console.log('Creating bid:', payload);
      const response = await fetch('http://127.0.0.1:8000/api/bids', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Bid creation response:', data);
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
      toast.success('Bid created successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err: any) {
      console.error('Bid creation error:', err.message);
      const errorMessage = err.message || 'Failed to create bid';
      setBidError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status !== 'pending') return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const formatAmount = (amount: number | string | null): string => {
    if (amount == null) return '0.00';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const displayedInvoices = showAllInvoices ? invoices : invoices.slice(0, 10);

  const handleTabChange = (tab: string) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
    if (tab === 'bids') setBidSubTab('create');
  };

  const getAnimationClass = () => {
    const tabOrder = ['book', 'invoices', 'bids'];
    const prevIndex = tabOrder.indexOf(prevTab);
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > prevIndex) return 'animate-slide-in-right';
    if (currentIndex < prevIndex) return 'animate-slide-in-left';
    return 'animate-fade-in';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-48 h-48 bg-teal-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative w-[1200px] h-[720px] bg-white rounded-xl shadow-lg p-8">
        <div className="relative flex border-b border-gray-200 mb-6">
          <button
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium relative z-10 transition-transform duration-300 transform hover:scale-105 ${
              activeTab === 'book' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
            }`}
            onClick={() => handleTabChange('book')}
          >
            <Package className="w-5 h-5" />
            <span>Book Shipment</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium relative z-10 transition-transform duration-300 transform hover:scale-105 ${
              activeTab === 'invoices' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
            }`}
            onClick={() => handleTabChange('invoices')}
          >
            <FileText className="w-5 h-5" />
            <span>Invoices</span>
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium relative z-10 transition-transform duration-300 transform hover:scale-105 ${
              activeTab === 'bids' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
            }`}
            onClick={() => handleTabChange('bids')}
          >
            <Gavel className="w-5 h-5" />
            <span>Bids</span>
          </button>
          <span
            className="absolute bottom-0 h-0.5 bg-teal-600 transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
            style={{
              width: `${100 / 3}%`,
              left: `${(['book', 'invoices', 'bids'].indexOf(activeTab) * 100) / 3}%`,
            }}
          />
        </div>

        <div className="relative h-[500px] overflow-y-auto">
          <div className="absolute inset-0">
            {activeTab === 'book' && (
              <div className={getAnimationClass()}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Book a Shipment</h1>
                  <p className="text-gray-600">Streamlined shipping with exclusive discounts</p>
                </div>
                {fetchingRoutes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading routes...</span>
                  </div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No routes available.</p>
                    <button
                      onClick={() => fetchRoutes()}
                      className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    <form onSubmit={handleGetDiscountCode} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Route</label>
                        <div className="relative">
                          <MapPin className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <select
                            name="route_id"
                            value={formData.route_id}
                            onChange={handleChange}
                            className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          >
                            <option value="">Select a route</option>
                            {routes.map((route) => (
                              <option key={route.id} value={route.id}>
                                {route.from_location} → {route.to_location}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Mode</label>
                        <div className="relative">
                          {formData.mode === 'air' ? (
                            <Plane className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          ) : (
                            <Ship className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          )}
                          <select
                            name="mode"
                            value={formData.mode}
                            onChange={handleChange}
                            className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          >
                            <option value="air">Air Freight</option>
                            <option value="sea">Sea Freight</option>
                          </select>
                        </div>
                      </div>
                      {formData.mode === 'air' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (KG)</label>
                          <div className="relative">
                            <Package className="w-5 h-_documentation
                            5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              name="weight_kg"
                              value={formData.weight_kg}
                              onChange={handleChange}
                              className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              step="0.1"
                              min="1"
                              placeholder="e.g., 10.5"
                            />
                          </div>
                        </div>
                      )}
                      {formData.mode === 'sea' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Volume (CBM)</label>
                          <div className="relative">
                            <Package className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              name="cbm"
                              value={formData.cbm}
                              onChange={handleChange}
                              className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              step="0.01"
                              min="0.1"
                              placeholder="e.g., 1.25"
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Address</label>
                        <div className="relative">
                          <MapPin className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            name="warehouse_address"
                            value={formData.warehouse_address}
                            onChange={handleChange}
                            className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                            placeholder="Enter warehouse address"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all flex items-center justify-center space-x-2 ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Booking...</span>
                          </>
                        ) : (
                          <span>Book Shipment</span>
                        )}
                      </button>
                    </form>
                    {discountCodeDetails && (
                      <div className="mt-6 p-6 bg-teal-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-teal-800 mb-4">Booking Confirmation</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Invoice Number:</span> {discountCodeDetails.invoice_number}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Amount:</span> ${discountCodeDetails.amount}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Discount Code:</span> {discountCodeDetails.discount_code}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Details:</span> {discountCodeDetails.label}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Warehouse Address:</span> {discountCodeDetails.warehouse_address}
                          </p>
                        </div>
                        <button
                          onClick={() => setDiscountCodeDetails(null)}
                          className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-all"
                        >
                          Book Another Shipment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className={getAnimationClass()}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Your Invoices</h1>
                  <p className="text-gray-600">Track and manage your invoice payments</p>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading invoices...</span>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 mt-4">No invoices found.</p>
                    <p className="text-gray-500 text-sm mt-1">Invoices will appear here when available.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-teal-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Invoice #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Shipment
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Route
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Due Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {displayedInvoices.map((invoice) => (
                          <tr
                            key={invoice.id}
                            className={`hover:bg-teal-25 ${
                              isOverdue(invoice.due_date, invoice.status) ? 'bg-red-50' : ''
                            }`}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {invoice.invoice_number}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <Link
                                to={`/shipments/${invoice.shipment_id}`}
                                className="text-teal-600 hover:text-teal-800 hover:underline flex items-center"
                              >
                                <LinkIcon className="w-4 h-4 mr-1" />
                                #{invoice.shipment_id} ({invoice.shipment?.mode || 'N/A'})
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {invoice.shipment?.route ? (
                                `${invoice.shipment.route.from_location} → ${invoice.shipment.route.to_location}`
                              ) : (
                                <span className="text-gray-400">Route unavailable</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              ${formatAmount(invoice.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'overdue' || isOverdue(invoice.due_date, invoice.status)
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {isOverdue(invoice.due_date, invoice.status) ? 'Overdue' : invoice.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(invoice.due_date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {invoices.length > 10 && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAllInvoices(!showAllInvoices)}
                          className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all"
                        >
                          {showAllInvoices ? (
                            <>
                              <ChevronUp className="w-5 h-5" />
                              <span>Show Less</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-5 h-5" />
                              <span>Show All ({invoices.length})</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bids' && (
              <div className={getAnimationClass()}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Your Bids</h1>
                  <p className="text-gray-600">Create and track your bids</p>
                </div>
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-transform duration-300 transform hover:scale-105 ${
                      bidSubTab === 'create' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
                    }`}
                    onClick={() => setBidSubTab('create')}
                  >
                    Create Bid
                  </button>
                  <button
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-transform duration-300 transform hover:scale-105 ${
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
                  <div>
                    {fetchingRoutes ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading routes...</span>
                      </div>
                    ) : routes.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600">No routes available.</p>
                        <button
                          onClick={() => fetchRoutes()}
                          className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all"
                        >
                          Retry
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleBidSubmit} className="space-y-4 max-w-lg mx-auto">
                        {bidError && <p className="text-red-500 text-sm">{bidError}</p>}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                          <div className="relative">
                            <MapPin className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <select
                              name="route_id"
                              value={bidForm.route_id}
                              onChange={handleBidChange}
                              className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
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
                              <Plane className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            ) : (
                              <Ship className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            )}
                            <select
                              name="mode"
                              value={bidForm.mode}
                              onChange={handleBidChange}
                              className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                            >
                              <option value="air">Air Freight</option>
                              <option value="sea">Sea Freight</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($ per KG/CBM)</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="base_price"
                              value={bidForm.base_price}
                              onChange={handleBidChange}
                              className="w-full pl-3 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              min="0.01"
                              step="0.01"
                              placeholder="e.g., 50.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                          <div className="relative">
                            <input
                              type="number"
                              name="discount_percentage"
                              value={bidForm.discount_percentage}
                              onChange={handleBidChange}
                              className="w-full pl-3 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="e.g., 10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <div className="relative">
                            <input
                              type="datetime-local"
                              name="start_date"
                              value={bidForm.start_date}
                              onChange={handleBidChange}
                              className="w-full pl-3 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <div className="relative">
                            <input
                              type="datetime-local"
                              name="end_date"
                              value={bidForm.end_date}
                              onChange={handleBidChange}
                              className="w-full pl-3 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              required
                              min={bidForm.start_date || new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all flex items-center justify-center space-x-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Creating Bid...</span>
                            </>
                          ) : (
                            <span>Create Bid</span>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
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
                            {bids.map((bid) => (
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
                                  ${bid.base_price.toFixed(2)}
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
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
          }
          .animate-pulse {
            animation: pulse 4s ease-in-out infinite;
          }
          .animation-delay-2000 {
            animation-delay: -2s;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-in-out;
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .animate-slide-in-left {
            animation: slideInLeft 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookShipment;

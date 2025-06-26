import React, { useState, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Package, Ship, Plane, MapPin, Loader2 } from 'lucide-react';
import type { Route } from './ShipperDashboard';

interface ShipmentContext {
  routes: Route[];
}

interface DiscountCodeDetails {
  discount_code: string;
  label: string;
  warehouse_address: string;
  invoice_number: string;
  amount: number;
}

const BookShipment = () => {
  const { routes } = useOutletContext<ShipmentContext>();
  const [formData, setFormData] = useState({
    route_id: '',
    mode: 'air',
    weight_kg: '',
    cbm: '',
    warehouse_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [discountCodeDetails, setDiscountCodeDetails] = useState<DiscountCodeDetails | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          Authorization: `Bearer ${token}`,
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
        theme: 'colored',
      });
      setDiscountCodeDetails({
        discount_code: data.discount_code,
        label: `Customer Name: ${data.customer_name}, Phone Number: ${data.phone_number}, Destination: ${
          routes.find((route) => route.id === data.shipment.route_id)?.to_location || 'Unknown'
        }, Mode of Shipping: ${data.shipment.mode}, Discount Code: ${data.discount_code}`,
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
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-slate-200/60 p-6">
      <ToastContainer />
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Book a Shipment</h1>
        <p className="text-sm text-slate-500">Streamlined shipping with exclusive discounts</p>
      </div>
      {routes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">No routes available.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <form onSubmit={handleGetDiscountCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Route</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  name="route_id"
                  value={formData.route_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Mode</label>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="air">Air Freight</option>
                  <option value="sea">Sea Freight</option>
                </select>
              </div>
            </div>
            {formData.mode === 'air' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (KG)</label>
                <div className="relative">
                  <Package className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Volume (CBM)</label>
                <div className="relative">
                  <Package className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="number"
                    name="cbm"
                    value={formData.cbm}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                    step="0.01"
                    min="0.1"
                    placeholder="e.g., 1.25"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse Address</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-teal-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  name="warehouse_address"
                  value={formData.warehouse_address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                  placeholder="Enter warehouse address"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl hover:bg-teal-700 transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span>Booking...</span>
                </>
              ) : (
                <span>Book Shipment</span>
              )}
            </button>
          </form>
          {discountCodeDetails && (
            <div className="mt-6 p-6 bg-teal-50 rounded-xl">
              <h3 className="text-lg font-semibold text-teal-800 mb-4">Booking Confirmation</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-medium">Invoice Number:</span> {discountCodeDetails.invoice_number}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ${discountCodeDetails.amount}
                </p>
                <p>
                  <span className="font-medium">Discount Code:</span> {discountCodeDetails.discount_code}
                </p>
                <p>
                  <span className="font-medium">Details:</span> {discountCodeDetails.label}
                </p>
                <p>
                  <span className="font-medium">Warehouse Address:</span> {discountCodeDetails.warehouse_address}
                </p>
              </div>
              <button
                onClick={() => setDiscountCodeDetails(null)}
                className="mt-4 w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200"
              >
                Book Another Shipment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookShipment;
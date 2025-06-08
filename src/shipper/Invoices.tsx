import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom';

interface Invoice {
  id: number;
  invoice_number: string;
  shipment_id: number;
  amount: number | string | null; // Allow string or null
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

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const location = useLocation();
  
  // Check if we're in the admin dashboard
  const isInAdminDashboard = location.pathname.startsWith('/admin');

  const fetchUserType = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch('http://127.0.0.1:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserType(data.user_type);
      }
    } catch (err) {
      console.error('Fetch user type error:', err);
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

  useEffect(() => {
    const loadData = async () => {
      await fetchUserType();
      await fetchInvoices();
    };
    loadData();
  }, []);

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

  // If we're in admin dashboard, render without the full-screen container
  if (isInAdminDashboard) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {userType === 'admin' ? 'All Invoices' : userType === 'agent' ? 'Agent Invoices' : 'My Invoices'}
          </h1>
          <p className="text-gray-600 mt-1">Manage and track invoice payments</p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading invoices...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No invoices found</p>
              <p className="text-gray-400 text-sm mt-1">Invoices will appear here when available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className={`hover:bg-gray-50 ${
                        isOverdue(invoice.due_date, invoice.status) ? 'bg-red-25' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link
                          to={`/shipments/${invoice.shipment_id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          #{invoice.shipment_id} ({invoice.shipment?.mode || 'N/A'})
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.shipment?.route ? (
                          `${invoice.shipment.route.from_location} → ${invoice.shipment.route.to_location}`
                        ) : (
                          <span className="text-gray-400">Route unavailable</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${formatAmount(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original standalone layout for non-admin routes
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8 flex items-center justify-center">
      <div className="relative max-w-4xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          {userType === 'admin' ? 'All Invoices' : userType === 'agent' ? 'Agent Invoices' : 'My Invoices'}
        </h1>
        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p>No invoices found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-4 text-left">Invoice #</th>
                  <th className="py-2 px-4 text-left">Shipment</th>
                  <th className="py-2 px-4 text-left">Route</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={`border-t ${
                      isOverdue(invoice.due_date, invoice.status) ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="py-2 px-4">{invoice.invoice_number}</td>
                    <td className="py-2 px-4">
                      <Link
                        to={`/shipments/${invoice.shipment_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {invoice.shipment_id} ({invoice.shipment?.mode || 'N/A'})
                      </Link>
                    </td>
                    <td className="py-2 px-4">
                      {invoice.shipment?.route ? (
                        `${invoice.shipment.route.from_location} to ${invoice.shipment.route.to_location}`
                      ) : (
                        'Route unavailable'
                      )}
                    </td>
                    <td className="py-2 px-4">${formatAmount(invoice.amount)}</td>
                    <td className="py-2 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-sm ${
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
                    <td className="py-2 px-4">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
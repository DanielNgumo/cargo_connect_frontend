import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, FileText } from 'lucide-react';

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

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const location = useLocation();

  const isInAdminDashboard = location.pathname.startsWith('/admin');

  const fetchUserType = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch('http://127.0.0.1:8000/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
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
          Authorization: `Bearer ${token}`,
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
      toast.error(err.message, {
        position: 'top-right',
        autoClose: 5000,
        theme: 'colored',
      });
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

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-sm border border-slate-200/60 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          {userType === 'admin' ? 'All Invoices' : userType === 'agent' ? 'Agent Invoices' : 'My Invoices'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track invoice payments</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
          <span className="ml-3 text-slate-600">Loading invoices...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-4 text-slate-600 text-lg">No invoices found</p>
          <p className="text-slate-500 text-sm mt-1">Invoices will appear here when available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Shipment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-teal-800 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className={`hover:bg-teal-50/50 transition-colors ${
                    isOverdue(invoice.due_date, invoice.status) ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    <Link
                      to={`/shipments/${invoice.shipment_id}`}
                      className="text-teal-600 hover:text-teal-800 hover:underline"
                    >
                      #{invoice.shipment_id} ({invoice.shipment?.mode || 'N/A'})
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {invoice.shipment?.route ? (
                      `${invoice.shipment.route.from_location} → ${invoice.shipment.route.to_location}`
                    ) : (
                      <span className="text-slate-400">Route unavailable</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                    ${formatAmount(invoice.amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-teal-100 text-teal-800'
                          : invoice.status === 'overdue' || isOverdue(invoice.due_date, invoice.status)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {isOverdue(invoice.due_date, invoice.status) ? 'Overdue' : invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoices;
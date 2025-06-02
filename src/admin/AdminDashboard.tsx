import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, CheckCircle } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  business_registration_number: string | null;
  contact_person: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingAgents = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Please log in as admin.');
        }

        const response = await fetch('http://127.0.0.1:8000/api/admin/pending-agents', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch agents');
        }

        setAgents(data.agents);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message, { position: 'top-right', autoClose: 5000 });
        if (err.message.includes('Unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingAgents();
  }, [navigate]);

  const handleApprove = async (agentId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://127.0.0.1:8000/api/admin/approve-agent/${agentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve agent');
      }

      toast.success('Agent approved!', { position: 'top-right', autoClose: 5000 });
      setAgents(agents.filter(agent => agent.id !== agentId));
    } catch (err: any) {
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <ToastContainer />
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <User className="w-8 h-8 mr-2" />
          Admin Dashboard - Pending Agents
        </h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</div>
        )}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : agents.length === 0 ? (
          <p className="text-gray-600">No pending agents.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agents.map(agent => (
                  <tr key={agent.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.phone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{agent.business_registration_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleApprove(agent.id)}
                        className="text-green-600 hover:text-green-800 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
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

export default AdminDashboard;


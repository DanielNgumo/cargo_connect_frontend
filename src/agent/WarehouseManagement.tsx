import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Warehouse, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Warehouse {
  id: number;
  agent_id: number;
  agent?: { id: number; name: string };
  address: string;
  type: 'local' | 'international';
}

interface Agent {
  id: number;
  name: string;
}

const WarehouseManagement: React.FC = () => {
  const [warehouseSubTab, setWarehouseSubTab] = useState('create');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [warehouseForm, setWarehouseForm] = useState({
    agent_id: '',
    address: '',
    type: 'local',
  });
  const [warehouseUpdateForm, setWarehouseUpdateForm] = useState({
    id: '',
    agent_id: '',
    address: '',
    type: 'local',
  });
  const [deleteWarehouseId, setDeleteWarehouseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAgents = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setAgents(Array.isArray(data.agents) ? data.agents : []);
    } catch (err: any) {
      console.error('Fetch agents error:', err.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAgents(retries - 1, delay * 2);
      }
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    }
  }, []);

  const fetchWarehouses = useCallback(async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/warehouses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouses: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setWarehouses(Array.isArray(data.warehouses) ? data.warehouses : []);
    } catch (err: any) {
      console.error('Fetch warehouses error:', err.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWarehouses(retries - 1, delay * 2);
      }
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
    fetchAgents();
  }, [fetchWarehouses, fetchAgents]);

  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          agent_id: parseInt(warehouseForm.agent_id),
          address: warehouseForm.address,
          type: warehouseForm.type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create warehouse');
      }
      setWarehouses([...warehouses, data.warehouse]);
      setWarehouseForm({ agent_id: '', address: '', type: 'local' });
      toast.success('Warehouse created successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch(`http://127.0.0.1:8000/api/warehouses/${warehouseUpdateForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          agent_id: parseInt(warehouseUpdateForm.agent_id),
          address: warehouseUpdateForm.address,
          type: warehouseUpdateForm.type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to update warehouse: ${response.status}`);
      }
      setWarehouses(warehouses.map(w => w.id === parseInt(warehouseUpdateForm.id) ? data.warehouse : w));
      setWarehouseUpdateForm({ id: '', agent_id: '', address: '', type: 'local' });
      toast.success('Warehouse updated successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch(`http://127.0.0.1:8000/api/warehouses/${deleteWarehouseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete warehouse');
      }
      setWarehouses(warehouses.filter(w => w.id !== parseInt(deleteWarehouseId)));
      setDeleteWarehouseId('');
      toast.success('Warehouse deleted successfully!', { position: 'top-right', autoClose: 3000 });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message, { position: 'top-right', autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWarehouseForm({ ...warehouseForm, [e.target.name]: e.target.value });
  };

  const handleWarehouseUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setWarehouseUpdateForm({ ...warehouseUpdateForm, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Warehouse Management</h2>
      <div className="flex border-b border-gray-200 mb-6 relative">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            warehouseSubTab === 'create' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setWarehouseSubTab('create')}
        >
          Create Warehouse
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            warehouseSubTab === 'view' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setWarehouseSubTab('view')}
        >
          View Warehouses
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            warehouseSubTab === 'update' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setWarehouseSubTab('update')}
        >
          Update Warehouse
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            warehouseSubTab === 'delete' ? 'text-teal-600 bg-teal-50 rounded-t-md' : 'text-gray-600 hover:text-teal-600'
          }`}
          onClick={() => setWarehouseSubTab('delete')}
        >
          Delete Warehouse
        </button>
        <span
          className="absolute bottom-0 h-0.5 bg-teal-600 transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]"
          style={{
            width: `${100 / 4}%`,
            left: `${(['create', 'view', 'update', 'delete'].indexOf(warehouseSubTab) * 100) / 4}%`,
          }}
        />
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">{error}</div>
      )}
      {warehouseSubTab === 'create' && (
        <form onSubmit={handleWarehouseSubmit} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              name="agent_id"
              value={warehouseForm.agent_id}
              onChange={handleWarehouseChange}
              required
              disabled={loading || agents.length === 0}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <option value="">Select Agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            {agents.length === 0 && !loading && (
              <p className="text-sm text-red-600 mt-1">No agents available. Please try again later.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={warehouseForm.address}
              onChange={handleWarehouseChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="e.g., 123 Main St"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={warehouseForm.type}
              onChange={handleWarehouseChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <option value="local">Local</option>
              <option value="international">International</option>
            </select>
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
              <span>Create Warehouse</span>
            )}
          </button>
        </form>
      )}
      {warehouseSubTab === 'view' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading warehouses...</span>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-12">
              <Warehouse className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600 mt-4">No warehouses found.</p>
              <p className="text-gray-500 text-sm mt-1">Warehouses will appear here when available.</p>
              <button
                onClick={() => fetchWarehouses()}
                className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-all"
              >
                Retry Fetching Warehouses
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Agent Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {warehouses.map(warehouse => (
                    <tr key={warehouse.id} className="hover:bg-teal-25">
                      <td className="px-4 py-3 text-sm text-gray-900">{warehouse.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {warehouse.agent?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{warehouse.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{warehouse.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {warehouseSubTab === 'update' && (
        <form onSubmit={handleWarehouseUpdate} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
            <select
              name="id"
              value={warehouseUpdateForm.id}
              onChange={handleWarehouseUpdateChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  ID: {warehouse.id} (Agent: {warehouse.agent?.name || warehouse.agent_id}, {warehouse.address})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              name="agent_id"
              value={warehouseUpdateForm.agent_id}
              onChange={handleWarehouseUpdateChange}
              required
              disabled={loading || agents.length === 0}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <option value="">Select Agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            {agents.length === 0 && !loading && (
              <p className="text-sm text-red-600 mt-1">No agents available. Please try again later.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={warehouseUpdateForm.address}
              onChange={handleWarehouseUpdateChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="e.g., 123 Main St"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={warehouseUpdateForm.type}
              onChange={handleWarehouseUpdateChange}
              required
              disabled={loading}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <option value="local">Local</option>
              <option value="international">International</option>
            </select>
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
                <span>Updating...</span>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <span>Update Warehouse</span>
            )}
          </button>
        </form>
      )}
      {warehouseSubTab === 'delete' && (
        <form onSubmit={handleWarehouseDelete} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
            <select
              value={deleteWarehouseId}
              onChange={e => setDeleteWarehouseId(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              required
              disabled={loading}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  ID: {warehouse.id} (Agent: {warehouse.agent?.name || warehouse.agent_id}, {warehouse.address})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <span>Deleting...</span>
                <Loader2 className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <span>Delete Warehouse</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default WarehouseManagement;
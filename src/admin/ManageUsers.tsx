import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface User {
  id: number;
  name: string | null;
  email: string;
  phone_number: string | null;
  user_type: 'admin' | 'agent' | 'shipper';
  business_registration_number: string | null;
  contact_person: string | null;
  is_approved: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'shippers' | 'agents' | 'admins'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const fetchUsers = async (retries = 3, delay = 1000) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      const response = await fetch('http://127.0.0.1:8000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        toast.error('Unauthorized. Please log in as an admin.');
        navigate('/login');
        return;
      }
      if (response.status === 404) {
        toast.error('Users endpoint not found. Contact support.');
        setUsers([]);
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchUsers(retries - 1, delay * 2);
      }
      toast.error(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      const response = await fetch(`http://127.0.0.1:8000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        toast.error('Unauthorized. Please log in as an admin.');
        navigate('/login');
        return;
      }
      if (response.status === 404) {
        toast.error('User not found or deletion endpoint unavailable.');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setUsers(users.filter((user) => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  interface HandleViewProps {
    (user: User): void;
  }

  const handleView: HandleViewProps = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on active tab
  const filteredUsers = users.filter((user) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'shippers') return user.user_type === 'shipper';
    if (activeTab === 'agents') return user.user_type === 'agent';
    if (activeTab === 'admins') return user.user_type === 'admin';
    return false;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Manage Users</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { name: 'All', key: 'all' },
            { name: 'Shippers', key: 'shippers' },
            { name: 'Agents', key: 'agents' },
            { name: 'Admins', key: 'admins' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'all' | 'shippers' | 'agents' | 'admins')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="py-3 px-4 text-left font-medium">Email</th>
                <th className="py-3 px-4 text-left font-medium">User Type</th>
                {activeTab !== 'shippers' && (
                  <th className="py-3 px-4 text-left font-medium">Approval Status</th>
                )}
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.user_type === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : user.user_type === 'agent'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.user_type}
                    </span>
                  </td>
                  {activeTab !== 'shippers' && (
                    <td className="py-3 px-4">
                      {user.user_type === 'shipper' ? (
                        <span className="text-gray-500">-</span>
                      ) : (
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.is_approved ? 'Approved' : 'Not Approved'}
                        </span>
                      )}
                    </td>
                  )}
                  <td className="py-3 px-4 flex space-x-2">
                    <button
                      onClick={() => handleView(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      disabled={user.user_type === 'admin' && user.id === parseInt(localStorage.getItem('userId') || '0')}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-8 max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">User Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-8">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">ID</label>
                    <p className="text-gray-900 font-medium">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900 font-medium">{selectedUser.name || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                    <p className="text-gray-900 font-medium">{selectedUser.phone_number || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">User Type</label>
                    <p className="text-gray-900 font-medium capitalize">{selectedUser.user_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Business Registration Number</label>
                    <p className="text-gray-900 font-medium">{selectedUser.business_registration_number || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Contact Person</label>
                    <p className="text-gray-900 font-medium">{selectedUser.contact_person || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Approval Status</label>
                    <p className="text-gray-900 font-medium">
                      {selectedUser.user_type === 'shipper' ? '-' : selectedUser.is_approved ? 'Approved' : 'Not Approved'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email Verified</label>
                    <p className="text-gray-900 font-medium">{selectedUser.email_verified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Updated At</label>
                    <p className="text-gray-900 font-medium">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
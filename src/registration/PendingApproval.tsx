import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const PendingApproval = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Clock className="w-4 h-4" />
          <span>Account Status</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Approval</h2>
        <p className="text-gray-600 text-sm mb-6">
          Your agent account is awaiting admin approval. You’ll be notified via email once your account is approved.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default PendingApproval;
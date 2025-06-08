// src/admin/Reports.tsx
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-2">View system analytics and generate reports</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
        <p className="text-gray-500">This feature is coming soon. You'll be able to view detailed analytics and reports here.</p>
      </div>
    </div>
  );
};

export default Reports;

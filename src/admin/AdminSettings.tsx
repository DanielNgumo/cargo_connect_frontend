

// src/admin/AdminSettings.tsx
import { Settings } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          System Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
        <p className="text-gray-500">This feature is coming soon. You'll be able to configure system settings here.</p>
      </div>
    </div>
  );
};

export default AdminSettings;
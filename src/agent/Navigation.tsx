// src/agent/Navigation.tsx
import React from 'react';
import { MapPin, Gavel, Warehouse } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col space-y-4">
      <button
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-transform duration-300 transform hover:scale-105 ${
          activeTab === 'create-route' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600'
        }`}
        onClick={() => setActiveTab('create-route')}
      >
        <MapPin className="w-5 h-5" />
        <span>Routes</span>
      </button>
      <button
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-transform duration-300 transform hover:scale-105 ${
          activeTab === 'gold-plan' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600'
        }`}
        onClick={() => setActiveTab('gold-plan')}
      >
        <Gavel className="w-5 h-5" />
        <span>Gold Plan</span>
      </button>
      <button
        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-md transition-transform duration-300 transform hover:scale-105 ${
          activeTab === 'warehouse' ? 'bg-teal-100 text-teal-600' : 'text-gray-600 hover:text-teal-600'
        }`}
        onClick={() => setActiveTab('warehouse')}
      >
        <Warehouse className="w-5 h-5" />
        <span>Warehouse</span>
      </button>
    </div>
  );
};

export default Navigation;
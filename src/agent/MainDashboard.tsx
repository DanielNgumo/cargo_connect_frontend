// src/agent/MainDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import RouteManagement from './RouteManagement';
import GoldPlan from './GoldPlan';
import WarehouseManagement from './WarehouseManagement';

// Export the Route interface
export interface Route {
  id: number;
  from_location: string;
  to_location: string;
  sea_price_per_cbm: number | null;
  air_price_per_kg: number | null;
  min_kg_air: number;
  min_cbm_sea: number;
  agent_id: number;
  agent?: { id: number; name: string; email: string };
}

const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create-route');
  const [routes, setRoutes] = useState<Route[]>([]);
  const navigate = useNavigate();

  const fetchRoutes = useCallback(async (retries = 3, delay = 1000) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      await fetch('http://127.0.0.1:8000/sanctum/csrf-cookie', { credentials: 'include' });
      const response = await fetch('http://127.0.0.1:8000/api/shipping-routes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setRoutes(Array.isArray(data.routes) ? data.routes : []);
    } catch (err: any) {
      console.error('Fetch routes error:', err.message);
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchRoutes(retries - 1, delay * 2);
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRoutes();
  }, [fetchRoutes, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 flex py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="relative flex w-full max-w-7xl mx-auto">
        <div className="w-64 bg-white/80 backdrop-blur-sm rounded-l-3xl shadow-lg p-6">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-r-3xl shadow-lg p-8">
          {activeTab === 'create-route' && <RouteManagement />}
          {activeTab === 'gold-plan' && <GoldPlan routes={routes} />}
          {activeTab === 'warehouse' && <WarehouseManagement />}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
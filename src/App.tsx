import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './common/Navbar';
import LandingPage from './landing/LandingPage';
import Login from './registration/Login';
import SignUp from './registration/Signup';
import PendingApproval from './registration/PendingApproval';
import AdminDashboard from './admin/AdminDashboard';
import PendingAgents from './admin/PendingAgents';
import ManageUsers from './admin/ManageUsers';
import ManageRoutes from './admin/ManageRoutes';
import Reports from './admin/Reports';
import AdminSettings from './admin/AdminSettings';
import Bids from './admin/Bids';
import MainDashboard from './agent/MainDashboard';
import RouteManagement from './agent/RouteManagement';
import GoldPlan from './agent/GoldPlan';
import WarehouseManagement from './agent/WarehouseManagement';
import ShipperDashboard from './shipper/ShipperDashboard';
import BookShipment from './shipper/BookShipment';
import Invoices from './shipper/Invoices';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAgentRoute = location.pathname.startsWith('/agent');
  const isShipperRoute = location.pathname.startsWith('/shipper');

  return (
    <>
      {!isAdminRoute && !isAgentRoute && !isShipperRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Shipper Routes */}
        <Route path="/shipper" element={<ShipperDashboard />}>
          <Route path="book-shipment" element={<BookShipment />} />
          <Route path="invoices" element={<Invoices />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<MainDashboard />}>
          <Route path="create-route" element={<RouteManagement />} />
          <Route path="gold-plan" element={<GoldPlan />} />
          <Route path="warehouse" element={<WarehouseManagement />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="pending-agents" element={<PendingAgents />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="routes" element={<ManageRoutes />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="bids" element={<Bids />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="font-sans">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
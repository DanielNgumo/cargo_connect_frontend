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
import BookShipment from './landing/BookShipment';
import Invoices from './shipper/Invoices';
import Bids from './admin/Bids';
import MainDashboard from './agent/MainDashboard';


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        {/* <Route path="/create-route" element={<CreateRoute />} /> */}
        <Route path="/agent-dashboard" element={<MainDashboard />} />
        <Route path="/book-shipment" element={<BookShipment />} />
        <Route path="/bids" element={<Bids />} />
        
        {/* Standalone Invoices route for non-admin users */}
        <Route path="/invoices" element={<Invoices />} />
        
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
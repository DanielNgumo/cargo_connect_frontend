// src/App.tsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import Login from './registration/Login';
import SignUp from './registration/Signup';
import PendingApproval from './registration/PendingApproval';
import CreateRoute from './routes/CreateRoute';
import AdminDashboard from './admin/AdminDashboard';
import BookShipment from './landing/BookShipment';

function App() {
  return (
    <div className="font-sans">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/create-route" element={<CreateRoute />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/book-shipment" element={<BookShipment />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
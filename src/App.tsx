import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './landing/LandingPage';
import Login from './registration/Login';
import SignUp from './registration/Signup';
function App() {
  return (
    <div className="font-sans">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
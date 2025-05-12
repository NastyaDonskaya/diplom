import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/login"; 
import Register from "./pages/register"; 
import DashboardLayout from './pages/dashboard';
import EmployeeDashboard from './pages/emp_dash';
import ProfilePage from './pages/profile';
import CreateAchieveType from './pages/test'
import CreateAchievement from './pages/createAchieve'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="createAchieveType" element={<CreateAchieveType />} />
          <Route path="createAchievement" element={<CreateAchievement />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;

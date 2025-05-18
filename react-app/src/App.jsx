import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/login"; 
import Register from "./pages/register"; 
import DashboardLayout from './pages/dashboard';
import EmployeeDashboard from './pages/emp_dash';
import ProfilePage from './pages/profile';
import CreateAchieveType from './pages/createAchieveType'
import CreateAchievement from './pages/createAchieve'
import CreateKpiType from "./pages/createKpiType";
import CreateKpiValue from "./pages/createKpi";
import CompanyPage from "./pages/company";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="main/:id" element={<EmployeeDashboard />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="createAchieveType" element={<CreateAchieveType />} />
          <Route path="createAchievement" element={<CreateAchievement />} />
          <Route path="createKpiType" element={<CreateKpiType />} />
          <Route path="createKpi" element={<CreateKpiValue />} />
          <Route path="company" element={<CompanyPage />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;

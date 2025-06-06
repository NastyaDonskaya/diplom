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
import AchievementPage from "./pages/achieveCard";
import AchievementsPage from "./pages/achievesTable";
import KpiCard from "./pages/kpiCard";
import KPI_table from "./pages/kpiTable";
import EditAchievement from "./pages/updateAchieve";
import AchievementTypePage from "./pages/achieveTypeCard";
import KpiTypePage from "./pages/kpiTypePage";


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
          <Route path="achievement/:id" element={<AchievementPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="kpiCard/:userId/:kpiTypeId" element={<KpiCard />} />
          <Route path="kpis" element={< KPI_table/>} />
          {/* <Route path="userReport" element={<UserReportPage/>} /> */}
          <Route path="achievement/:id/edit" element={< EditAchievement />}/>
          <Route path="achieveType/:id" element={<AchievementTypePage />}/>
          <Route path="kpiType/:id" element={<KpiTypePage />}/>
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;

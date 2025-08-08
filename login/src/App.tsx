import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLogin } from "./pages/AdminLogin";
import { CitizenRegister } from "./pages/CitizenRegister";
import { ProgressTracking } from "./pages/ProgressTracking";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ClearCookies } from "./pages/ClearCookies";

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Home page */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Index />} />
      
      {/* Citizen routes */}
      <Route path="/loginCitizen" element={<CitizenRegister />} />
      <Route path="/progressCitizen" element={<ProgressTracking />} />
      
      {/* Admin routes */}
      <Route path="/loginAdmin" element={<AdminLogin />} />
      <Route path="/dashboardAdmin" element={<AdminDashboard />} />
      
      {/* Utility routes */}
      <Route path="/clear-cookies" element={<ClearCookies />} />
      
      {/* Catch all - must be last */}
      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
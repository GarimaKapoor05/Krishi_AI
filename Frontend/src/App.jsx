import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Preserved working features
import MarketIntelligence from "./pages/MarketIntelligence";
import GovSchemeAdvisor from "./pages/GovSchemeAdvisor";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import SmartIrrigationAdvisor from "./pages/SmartIrrigationAdvisor";
import { DiseaseDetectionPage } from "./pages/DiseaseDetectionPage";
import ContactPage from "./pages/ContactPage";
import AdminListings from "./pages/AdminListings";

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isOnboarding = pathname === "/onboarding";
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200 flex flex-col justify-between">
      {!isOnboarding && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Landing & Onboarding */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Core Farmer Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          {/* Feature: Crop Disease Detection (MobileNetV2) */}
          <Route path="/features/disease-detection" element={<DiseaseDetectionPage onBackToDashboard={() => navigate("/dashboard")} />} />

          {/* Preserved Feature: Mandi Prices */}
          <Route path="/features/market-intelligence" element={<MarketIntelligence />} />

          {/* Preserved Feature: Government Schemes */}
          <Route path="/features/schemes" element={<GovSchemeAdvisor />} />

          {/* Irrigation guidance remains available as a standalone tool */}
          <Route path="/features/irrigation" element={<SmartIrrigationAdvisor />} />

          {/* Preserved Feature: Farmer Marketplace */}
          <Route path="/marketplace" element={<BuyerDashboard />} />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute>
                <AdminListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Graceful redirects for removed standalone tool routes */}
          <Route path="/crop-prediction" element={<Navigate to="/dashboard" replace />} />
          <Route path="/fertilizer-prediction" element={<Navigate to="/dashboard" replace />} />
          <Route path="/features/price-prediction" element={<Navigate to="/features/market-intelligence" replace />} />
          <Route path="/disease-detection" element={<Navigate to="/features/disease-detection" replace />} />
          <Route path="/disease-ai" element={<Navigate to="/features/disease-detection" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isOnboarding && <Footer />}
    </div>
  );
}

export default App;

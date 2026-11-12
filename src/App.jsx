<<<<<<< HEAD
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/HomePage';
import Navbar from './components/Navbar/Navbar';
import ProductsPage from './components/Products/ProductsPage';
import ServicePage from './components/Services/ServicesPage';
import CorporateTrainingsPage from './components/CorporateTrainings/CorporateTrainingsPage';
import OurClientsPage from './components/OurClients/OurClientsPage';
import OurResearchPage from './components/Research/ResearchPage';
import AboutUsPage from './components/AboutUs/AboutUsPage';
import CareerPage from './components/Careers/CareersPage'; 
import BlockchainServicesPage from './components/BlockchainAnalyticsServices/BlockChainServicesPage';
import AIServicePage from './components/AIServices/AIServicesPage';
import ContactUsPage from './components/ContactUs/ContactUsPage';
import BackendJobListingsPage from './components/JobDescription/BackendDeveloper/JobDescriptionPage';
import DSJobListingsPage from './components/JobDescription/DataScientist/JobDescriptionPage';
import AIBAJobListingsPage from './components/JobDescription/AIBusinessAnalyst/JobDescriptionPage';
import Web3BAJobListingsPage from './components/JobDescription/Web3BusinessAnalyst/JobDescriptionPage';
import SolDevJobListingsPage from './components/JobDescription/SolidityDeveloper/JobDescriptionPage';
import ResearchPublicationsPage from './components/ResearchPublications/ResearchPublicationsPage';
import TradingViewWidget from './pages/TradingView';
=======
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
>>>>>>> 6d0f021 (Semiconductor V1)

import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";
import RouteFallback from "./components/layout/RouteFallback";
import CursorGlow from "./components/fx/CursorGlow";
import RouteTracker from "./components/layout/RouteTracker";
import ConsentBanner from "./components/layout/ConsentBanner";

// Each page is its own chunk, so the home page does not pay for the roadmap, forms or job pages.
const HomePage = lazy(() => import("./components/Home/HomePage"));
const ProductsPage = lazy(() => import("./components/Products/ProductsPage"));
const CustomersPage = lazy(() => import("./components/Customers/CustomersPage"));

// The staff console is its own chunk and is never part of the public pages.
const AdminApp = lazy(() => import("./admin/AdminApp"));
const RoadmapPage = lazy(() => import("./components/Roadmap/RoadmapPage"));
const TechnologyPage = lazy(() => import("./components/Technology/TechnologyPage"));
const AboutUsPage = lazy(() => import("./components/AboutUs/AboutUsPage"));
const CareersPage = lazy(() => import("./components/Careers/CareersPage"));
const JobDescriptionPage = lazy(() => import("./components/Careers/JobDescriptionPage"));
const ContactUsPage = lazy(() => import("./components/ContactUs/ContactUsPage"));
const PrivacyPage = lazy(() => import("./components/Privacy/PrivacyPage"));
const NotFoundPage = lazy(() => import("./components/NotFound/NotFoundPage"));

function App() {
  const { pathname } = useLocation();

  // The staff console renders on its own: no public navigation, cursor effects, consent banner or analytics.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
<<<<<<< HEAD
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/demo" element={<TradingViewWidget />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/trainings" element={<CorporateTrainingsPage />} />
          <Route path="/clients" element={<OurClientsPage />} />
          <Route path="/research" element={<OurResearchPage />} />
          <Route path="/about-Us" element={<AboutUsPage />} />
          <Route path="/careers" element={<CareerPage />} />
          <Route path="/services/blockchainservicespage" element={<BlockchainServicesPage />} />
          <Route path="/services/aiservices" element={<AIServicePage />} />
          <Route path="/research/researchpublications" element={<ResearchPublicationsPage />} />
          <Route path="/careers/joblistings-backend" element={<BackendJobListingsPage />} />
          <Route path="/careers/joblistings-datascientist" element={<DSJobListingsPage />} />
          <Route path="/careers/joblistings-aibusinessanalyst" element={<AIBAJobListingsPage />} />
          <Route path="/careers/joblistings-web3businessanalyst" element={<Web3BAJobListingsPage />} />
          <Route path="/careers/joblistings-solditydeveloper" element={<SolDevJobListingsPage />} />
          <Route path="/contactus" element={<ContactUsPage />} scrollToTop />
=======
          <Route path="/admin/*" element={<AdminApp />} />
>>>>>>> 6d0f021 (Semiconductor V1)
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <CursorGlow />
      <RouteTracker />
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/technology" element={<TechnologyPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/:slug" element={<JobDescriptionPage />} />
          <Route path="/contactus" element={<ContactUsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* URLs from the previous (applied-AI) site: kept alive so links and search results resolve. */}
          <Route path="/ip" element={<Navigate to="/products" replace />} />
          <Route path="/services" element={<Navigate to="/products" replace />} />
          <Route path="/services/aiservices" element={<Navigate to="/products" replace />} />
          <Route path="/trainings" element={<Navigate to="/" replace />} />
          <Route path="/clients" element={<Navigate to="/customers" replace />} />
          <Route path="/research" element={<Navigate to="/technology" replace />} />
          <Route path="/research/researchpublications" element={<Navigate to="/technology" replace />} />
          <Route path="/careers/joblistings-backend" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/joblistings-datascientist" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/joblistings-aibusinessanalyst" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/backend-developer" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/data-scientist" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/ai-business-analyst" element={<Navigate to="/careers" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ConsentBanner />
    </>
  );
}

export default App;

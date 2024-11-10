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
import JobListingsPage from './components/JobDescription/JobDescriptionPage';
import ResearchPublicationsPage from './components/ResearchPublications/ResearchPublicationsPage';


function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/trainings" element={<CorporateTrainingsPage />} />
          <Route path="/clients" element={<OurClientsPage />} />
          <Route path="/research" element={<OurResearchPage />} />
          <Route path="/about-Us" element={<AboutUsPage />} />
          <Route path="/careers" element={<CareerPage />} />
          <Route path="/services/blockchainservicespage" element={<BlockchainServicesPage />} />
          <Route path="/services/aiservices" element={<AIServicePage />} />
          <Route path="/research/researchpublications" element={<ResearchPublicationsPage />} />
          <Route path="/careers/joblistings" element={<JobListingsPage />} />
          <Route path="/contactus" element={<ContactUsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home';
import Navbar from './components/Home/Navbar/Navbar';
import Footer from './components/Footer';
import ProductsPage from './components/Products/ProductsPage';
import ServicePage from './components/Services/ServicesPage';
import CorporateTrainingsPage from './components/CorporateTrainings/CorporateTrainings/CorporateTrainingsPage.jsx';
import OurClientsPage from './components/OurClients/Home/OurClientsPage';
import OurResearchPage from './components/Research/Research/ResearchPage';
import AboutUsPage from './components/AboutUs/pages/AboutUs';
import CareerPage from './components/Careers/CareersPage.jsx';

function App() {
  return (
   
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<><Home /></>} />
            <Route path="/Products" element={<><ProductsPage /></>} />
            <Route path="/service" element={<ServicePage />} />
            <Route path="/corporate-trainings" element={<CorporateTrainingsPage />} />
            <Route path="/our-clients" element={<OurClientsPage />} />
            <Route path="/our-research" element={<OurResearchPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/career" element={<CareerPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
   
  );
}

export default App;
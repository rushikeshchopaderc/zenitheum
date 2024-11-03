import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home/Home';
import Web2Solutions from './pages/Web2Solutions';
import Web3Solutions from './pages/Web3Solutions';
import AboutUs from './pages/AboutUs';
import Career from './pages/Career';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer';
import ProjectDetails from './pages/ProjectDetails';


function App() {
  return (
   
      <div className="flex flex-col min-h-screen bg-black">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/web2" element={<Web2Solutions />} />
            <Route path="/web3" element={<Web3Solutions />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/career" element={<Career />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
          </Routes>
        </main>
        <Footer />
      </div>
   
  );
}

export default App;
import React from 'react';
import { Link } from 'react-router-dom';

const Web3Solutions = () => {
  const projects = [
    { name: 'ETL/API Tools', path: '/projects/etl-api-tools' },
    { name: 'BigQuery Public Datasets', path: '/projects/bigquery-public-datasets' },
    { name: 'Web3 Marketplace', path: '/projects/web3-marketplace' },
    { name: 'Blockchain with Moralis', path: '/projects/blockchain-with-moralis' }
  ];

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Web3 Solutions - Projects</h2>
      <p className="text-center max-w-3xl mx-auto mb-12">
        Explore our range of Web3 projects, from decentralized applications to blockchain integration for various industries.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <Link to={project.path} key={index} className="block">
            <div className="bg-white shadow-md rounded-lg p-6 transform hover:scale-105 transition duration-300">
              <h4 className="text-2xl font-semibold text-blue-600">{project.name}</h4>
              <p className="text-gray-700 mt-2">Click here to learn more about {project.name}.</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Web3Solutions;
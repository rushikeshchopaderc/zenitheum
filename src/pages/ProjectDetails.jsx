import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const { id } = useParams();
  
  const projectInfo = {
    "etl-api-tools": {
      title: "ETL/API Tools Projects",
      description: "We developed ETL pipelines for various clients using cutting-edge API integrations."
    },
    "bigquery-public-datasets": {
      title: "BigQuery Public Datasets Projects",
      description: "Worked with BigQuery public datasets to provide data insights for industries."
    },
    "web3-marketplace": {
      title: "Web3 Marketplace Projects",
      description: "Helped clients build decentralized Web3 marketplaces using blockchain technology."
    },
    "blockchain-with-moralis": {
      title: "Native Blockchain Projects with Moralis",
      description: "Created native blockchain applications with Moralis for scalable solutions."
    }
  };

  const project = projectInfo[id];

  if (!project) {
    return <div className="p-8">Project not found!</div>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">{project.title}</h2>
      <p>{project.description}</p>
    </div>
  );
};

export default ProjectDetails;
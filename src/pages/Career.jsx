import React from 'react';

const Career = () => {
  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Career Opportunities</h2>
      <p className="text-center max-w-3xl mx-auto mb-12">
        We are always looking for talented professionals to join our team. Please send your resume to <span className="font-semibold text-blue-600">careers@zenitheum.com</span>.
      </p>

      <div className="max-w-xl mx-auto">
        <img
          src="https://static.vecteezy.com/system/resources/previews/004/511/628/original/we-are-hiring-design-for-recruitment-poster-free-vector.jpg"
          alt="Career"
          className="w-full rounded-lg shadow-md transform hover:scale-105 transition duration-300"
        />
      </div>
    </div>
  );
};

export default Career;
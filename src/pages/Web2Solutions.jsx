import React from 'react';

const Web2Solutions = () => {
  const testimonials = [
    {
      name: "Client A",
      feedback: "Their AI solutions helped transform our workflow!"
    },
    {
      name: "Client B",
      feedback: "The training provided by AI Web Solutions boosted our team's productivity."
    }
  ];

  return (
    <div className="bg-gray-100 p-8 min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Web2 Solutions - AI Training</h2>
      <p className="text-center max-w-3xl mx-auto mb-12">
        We specialize in providing top-notch AI training programs to help organizations succeed in their AI journey.
      </p>

      <h3 className="text-3xl font-semibold text-gray-700 mb-6">Client Testimonials</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6 transform hover:scale-105 transition duration-300">
            <h4 className="text-2xl font-semibold text-blue-600">{testimonial.name}</h4>
            <p className="text-gray-700 mt-4">{testimonial.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Web2Solutions;
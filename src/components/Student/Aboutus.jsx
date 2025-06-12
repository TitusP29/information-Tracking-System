import React from 'react';

function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">About The GAS</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">GRACE Artisan School</h2>
          <p className="text-lg text-blue-500 italic mb-2">Shape the future of clean energy at the GRACE Artisan School (G.A.S).</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <section className="mb-6">
            <p className="text-gray-700 mb-4">
              <span className="font-semibold text-blue-700">GRACE Artisan School (G.A.S)</span> is a Quality Council for Trades and Occupations accredited and the Energy & Water SETA aligned institution offering training & NQF certifications to build Artisan skills in the energy sector.
            </p>
            <p className="text-gray-700 mb-4">
              Our programmes equip Artisans to work towards becoming 21st century global leaders, from securing market-relevant skills, global employment, to designing, installing, and maintaining renewable energy systems in sustainable industrialization projects.
            </p>
            <p className="text-green-700 font-semibold text-lg text-center">Join us, and build a sustainable tomorrow.</p>
          </section>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Institution Profile</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">OUR PHILOSOPHY</h3>
              <h4 className="text-md text-blue-600 font-semibold">What Drives Us</h4>
              <p className="text-green-700 font-bold">Global Human Development</p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 shadow">
              <h3 className="text-lg font-bold text-blue-700 mb-2">Our Vision</h3>
              <p className="text-gray-700">Forge the 21st Century Global Energy Leaders</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 shadow">
              <h3 className="text-lg font-bold text-blue-700 mb-2">Our Mission</h3>
              <p className="text-gray-700">Deliver Programmes that Contribute to Global Human Development.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 shadow">
              <h3 className="text-lg font-bold text-blue-700 mb-2">Our Values</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Community - Collaboration</li>
                <li>Innovation - Excellence</li>
                <li>Sustainability - Mastery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs; 
import React from 'react';

function AboutUs() {
  return (
    <div className="about-us-container">
      <div className="about-header">
        <h1>About The GAS</h1>
        <h2>GRACE Artisan School</h2>
        <p className="tagline">Shape the future of clean energy at the GRACE Artisan School (G.A.S).</p>
      </div>

      <div className="about-content">
        <section className="about-intro">
          <p>
            GRACE Artisan School (G.A.S) is a Quality Council for Trades and Occupations accredited 
            and the Energy & Water SETA aligned institution offering training & NQF certifications 
            to build Artisan skills in the energy sector.
          </p>
          <p>
            Our programmes equip Artisans to work towards becoming 21st century global leaders, 
            from securing market-relevant skills, global employment, to designing, installing, 
            and maintaining renewable energy systems in sustainable industrialization projects.
          </p>
          <p className="join-call">
            Join us, and build a sustainable tomorrow.
          </p>
        </section>

        <section className="institution-profile">
          <h2>Institution Profile</h2>
          
          <div className="profile-section">
            <h3>OUR PHILOSOPHY</h3>
            <h4>What Drives Us</h4>
            <p className="philosophy">Global Human Development</p>
          </div>

          <div className="vision-mission-values">
            <div className="vision">
              <h3>Our Vision</h3>
              <p>Forge the 21st Century Global Energy Leaders</p>
            </div>

            <div className="mission">
              <h3>Our Mission</h3>
              <p>Deliver Programmes that Contribute to Global Human Development.</p>
            </div>

            <div className="values">
              <h3>Our Values</h3>
              <ul>
                <li>Community - Collaboration</li>
                <li>Innovation - Excellence</li>
                <li>Sustainability - Mastery</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs; 
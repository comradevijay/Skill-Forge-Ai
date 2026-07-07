import React from 'react';

const partners = [
  { name: 'Google', color: '#4285F4' },
  { name: 'Microsoft', color: '#5E5E5E' },
  { name: 'amazon', color: '#FF9900', italic: true },
  { name: 'TATA', color: '#003366' },
  { name: 'Infosys', color: '#007CC3' },
  { name: 'wipro', color: '#341858' },
  { name: 'accenture', color: '#A100FF' },
  { name: 'Cognizant', color: '#1B3A6B' },
  { name: 'Capgemini', color: '#0070AD' },
  { name: 'Deloitte.', color: '#000000' },
  { name: 'IBM', color: '#006699' },
  { name: 'L&T Infotech', color: '#F7941E' },
  { name: 'Tech Mahindra', color: '#E4002B' },
  { name: 'HCL', color: '#0073C6' },
  { name: 'ORACLE', color: '#F80000' },
  { name: 'SAP', color: '#0FAAFF', badge: true },
  { name: 'Adobe', color: '#FF0000' },
  { name: 'salesforce', color: '#00A1E0' },
  { name: 'DELL', color: '#007DB8' },
  { name: 'intel', color: '#0071C5' },
  { name: 'servicenow', color: '#293E40' },
  { name: 'JPMorgan', color: '#000000', serif: true },
  { name: 'CISCO', color: '#1BA0D7' },
  { name: 'pwc', color: '#FF7900', italic: true },
  { name: 'Schneider Electric', color: '#3DCD58' },
  { name: 'zomato', color: '#E23744', italic: true },
  { name: 'PayPal', color: '#00457C' },
  { name: "BYJU'S", color: '#54177D' },
  { name: 'PhonePe', color: '#5F259F' },
  { name: 'Flipkart', color: '#2874F0' },
];

const stats = [
  { label: 'Hiring Partners', value: '250+', theme: 'icon-blue-bg' },
  { label: 'Learners Placed', value: '10,000+', theme: 'icon-green-bg' },
  { label: 'Placement Rate', value: '95%', theme: 'icon-purple-bg' },
  { label: 'Countries', value: '10+', theme: 'icon-orange-bg' },
];

const Partners = () => {
  return (
    <section id="companies" className="partners-section">
      <p className="partners-label">Our Hiring Partners</p>
      <div className="partners-underline"><span></span></div>
      <h2 className="partners-heading">Trusted By <span>Top Companies</span></h2>
      <p className="partners-sub">Our learners are placed at leading companies<br />across the globe.</p>

      <div className="partners-grid">
        {partners.map((p) => (
          <div className="partner-card" key={p.name}>
            <span
              className="logo-text"
              style={{
                color: p.color,
                fontStyle: p.italic ? 'italic' : undefined,
                fontFamily: p.serif ? 'serif' : undefined,
                background: p.badge ? '#003366' : undefined,
                padding: p.badge ? '4px 10px' : undefined,
                borderRadius: p.badge ? '4px' : undefined,
              }}
            >
              {p.name}
            </span>
          </div>
        ))}
      </div>

      <div className="stats-bar">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <div className={`stat-icon ${s.theme}`} />
            <div className="stat-text"><strong>{s.value}</strong><span>{s.label}</span></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Partners;

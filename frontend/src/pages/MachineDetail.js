import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './MachineDetail.css';

// Machine data with descriptions and pricing
const machineData = {
  '3d-printing': {
    title: '3D Printing',
    icon: '🖨️',
    description: 'Professional 3D printing services for prototyping and production. Our 3D printers support various materials and can create complex geometries with high precision.',
    equipment: [
      'FDM Printers (PLA, ABS, PETG)',
      'Resin Printers (SLA/DLP)',
      'Large Format Printers',
      'Post-processing Equipment'
    ],
    pricing: [
      { material: 'PLA Filament', cost: '$0.10 per gram', notes: 'Most common material' },
      { material: 'ABS Filament', cost: '$0.12 per gram', notes: 'Higher temperature resistance' },
      { material: 'PETG Filament', cost: '$0.15 per gram', notes: 'Chemical resistant' },
      { material: 'Resin (SLA)', cost: '$0.20 per gram', notes: 'High detail prints' },
      { material: 'Support Material', cost: '$0.08 per gram', notes: 'For complex geometries' }
    ],
    requirements: [
      'STL file format required',
      'Maximum build volume: 300x300x400mm',
      'Minimum layer height: 0.1mm',
      'Safety training required'
    ]
  },
  'electronics': {
    title: 'Electronics',
    icon: '⚡',
    description: 'Complete electronics workstation with professional tools for circuit design, prototyping, and testing. Perfect for Arduino, Raspberry Pi, and custom PCB projects.',
    equipment: [
      'Soldering Stations',
      'Oscilloscopes & Multimeters',
      'Arduino & Raspberry Pi',
      'PCB Design Software'
    ],
    pricing: [
      { material: 'Arduino Uno', cost: '$25.00', notes: 'Microcontroller board' },
      { material: 'Raspberry Pi 4', cost: '$75.00', notes: 'Single-board computer' },
      { material: 'Breadboard', cost: '$5.00', notes: 'Prototyping board' },
      { material: 'Jumper Wires', cost: '$0.50 each', notes: 'Connection wires' },
      { material: 'Resistors (Pack)', cost: '$3.00', notes: 'Various values' },
      { material: 'LEDs (Pack)', cost: '$2.00', notes: 'Various colors' }
    ],
    requirements: [
      'Basic electronics knowledge recommended',
      'Safety glasses required',
      'Proper handling of components',
      'Clean workspace policy'
    ]
  },
  'cnc-machining': {
    title: 'CNC & Machining',
    icon: '🔪',
    description: 'Computer-controlled manufacturing tools for precision cutting and machining. Ideal for metal, wood, and plastic fabrication projects.',
    equipment: [
      'CNC Milling Machines',
      'Laser Cutters',
      'Plasma Cutters',
      'Water Jet Cutters'
    ],
    pricing: [
      { material: 'Aluminum Sheet', cost: '$15.00 per sq ft', notes: 'Various thicknesses' },
      { material: 'Steel Sheet', cost: '$12.00 per sq ft', notes: 'Mild steel' },
      { material: 'Acrylic Sheet', cost: '$8.00 per sq ft', notes: 'Clear/colored' },
      { material: 'Plywood', cost: '$5.00 per sq ft', notes: 'Various grades' },
      { material: 'Cutting Fluid', cost: '$2.00 per hour', notes: 'Machine operation' }
    ],
    requirements: [
      'CAD file in appropriate format',
      'Material specifications required',
      'Advanced training mandatory',
      'Safety equipment provided'
    ]
  },
  'woodworking': {
    title: 'Woodworking',
    icon: '🪵',
    description: 'Traditional woodworking tools and equipment for furniture making, cabinetry, and general wood projects. Professional-grade tools for all skill levels.',
    equipment: [
      'Table Saws & Band Saws',
      'Planers & Jointers',
      'Drill Presses',
      'Hand Tools & Clamps'
    ],
    pricing: [
      { material: 'Oak Lumber', cost: '$8.00 per board ft', notes: 'Hardwood' },
      { material: 'Pine Lumber', cost: '$4.00 per board ft', notes: 'Softwood' },
      { material: 'Plywood (4x8)', cost: '$45.00', notes: 'Various grades' },
      { material: 'Wood Glue', cost: '$3.00', notes: 'Per bottle' },
      { material: 'Sandpaper', cost: '$2.00 per sheet', notes: 'Various grits' },
      { material: 'Wood Stain', cost: '$8.00', notes: 'Per quart' }
    ],
    requirements: [
      'Safety training required',
      'Protective equipment mandatory',
      'Clean-up after use',
      'Tool maintenance responsibility'
    ]
  },
  'textiles-sewing': {
    title: 'Textiles & Sewing',
    icon: '✂️',
    description: 'Industrial sewing machines and textile equipment for fashion design, upholstery, and fabric projects. Professional machines for all sewing needs.',
    equipment: [
      'Industrial Sewing Machines',
      'Embroidery Machines',
      'Fabric Cutters',
      'Ironing Stations'
    ],
    pricing: [
      { material: 'Cotton Fabric', cost: '$8.00 per yard', notes: 'Various patterns' },
      { material: 'Denim Fabric', cost: '$12.00 per yard', notes: 'Heavy weight' },
      { material: 'Thread (Spool)', cost: '$2.00', notes: 'Various colors' },
      { material: 'Zippers', cost: '$3.00 each', notes: 'Various sizes' },
      { material: 'Buttons', cost: '$0.50 each', notes: 'Various styles' },
      { material: 'Interfacing', cost: '$4.00 per yard', notes: 'Fusible/non-fusible' }
    ],
    requirements: [
      'Basic sewing knowledge helpful',
      'Machine threading training',
      'Pattern reading skills',
      'Fabric care instructions'
    ]
  },
  'graphic-design': {
    title: 'Graphic Design',
    icon: '🎨',
    description: 'Digital design and printing equipment for posters, banners, vinyl graphics, and promotional materials. Professional-grade output for all design projects.',
    equipment: [
      'Large Format Printers',
      'Vinyl Cutters',
      'Heat Press Machines',
      'Design Software Access'
    ],
    pricing: [
      { material: 'Poster Paper (24x36)', cost: '$3.00 per sheet', notes: 'Glossy/matte' },
      { material: 'Vinyl (12x12)', cost: '$5.00 per sheet', notes: 'Various colors' },
      { material: 'Heat Transfer Vinyl', cost: '$8.00 per sheet', notes: 'Iron-on material' },
      { material: 'Banner Material', cost: '$6.00 per sq ft', notes: 'Weather resistant' },
      { material: 'Lamination', cost: '$2.00 per sq ft', notes: 'Protective coating' }
    ],
    requirements: [
      'High-resolution files preferred',
      'CMYK color mode for printing',
      'File format specifications',
      'Design consultation available'
    ]
  }
};

const MachineDetail = () => {
  const { machineType } = useParams();
  const machine = machineData[machineType];

  if (!machine) {
    return (
      <div className="machine-detail">
        <div className="container">
          <div className="error-message">
            <h1>Machine Not Found</h1>
            <p>The requested machine type could not be found.</p>
            <Link to="/equipment" className="btn btn-primary">Back to Equipment</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="machine-detail">
      <main className="main-content">
        <div className="container">
          {/* Back Button */}
          <div className="back-button">
            <Link to="/equipment" className="btn btn-secondary">← Back to Equipment</Link>
          </div>

          {/* Machine Header */}
          <section className="machine-header">
            <div className="machine-icon">{machine.icon}</div>
            <h1>{machine.title}</h1>
            <p className="machine-description">{machine.description}</p>
          </section>

          {/* Equipment List */}
          <section className="equipment-section">
            <h2>Available Equipment</h2>
            <div className="equipment-grid">
              {machine.equipment.map((item, index) => (
                <div key={index} className="equipment-item">
                  <span className="equipment-check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Table */}
          <section className="pricing-section">
            <h2>Material Pricing</h2>
            <div className="pricing-table-container">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cost</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {machine.pricing.map((item, index) => (
                    <tr key={index}>
                      <td>{item.material}</td>
                      <td className="cost">{item.cost}</td>
                      <td className="notes">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Requirements */}
          <section className="requirements-section">
            <h2>Requirements & Guidelines</h2>
            <div className="requirements-list">
              {machine.requirements.map((requirement, index) => (
                <div key={index} className="requirement-item">
                  <span className="requirement-icon">⚠️</span>
                  <span>{requirement}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <section className="action-section">
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => window.open('https://fab.makerspace.rutgers.edu/#!/machines', '_blank')}
              >
                Book This Equipment
              </button>
              <Link to="/equipment" className="btn btn-secondary">
                View All Equipment
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MachineDetail;

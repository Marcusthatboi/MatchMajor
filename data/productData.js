// server/data/productData.js
const products = [
  {
    name: 'Starter Tech Bundle',
    description: 'Perfect for beginners, this bundle includes basic hardware and software to get started.',
    price: 499.99,
    category: 'Bundle',
    image: 'https://via.placeholder.com/300x300?text=Starter+Bundle',
    features: [
      'Entry-level laptop',
      'Office software suite',
      'Basic antivirus protection',
      '1-year technical support'
    ],
    inStock: true
  },
  {
    name: 'Professional Workstation Bundle',
    description: 'Complete setup for professionals with high-performance hardware and software.',
    price: 1299.99,
    category: 'Bundle',
    image: 'https://via.placeholder.com/300x300?text=Pro+Bundle',
    features: [
      'High-performance desktop computer',
      'Dual monitors',
      'Professional software suite',
      'Advanced security package',
      '2-year premium support'
    ],
    inStock: true
  },
  {
    name: 'Ultra-Performance Laptop',
    description: 'Cutting-edge laptop with the latest processor and graphics capabilities.',
    price: 1799.99,
    category: 'Hardware',
    image: 'https://via.placeholder.com/300x300?text=Ultra+Laptop',
    features: [
      'Latest generation processor',
      '32GB RAM',
      '1TB SSD',
      'High-end dedicated graphics',
      'Ultra HD display'
    ],
    inStock: true
  },
  {
    name: 'Designer Software Suite',
    description: 'Complete software package for professional designers and artists.',
    price: 599.99,
    category: 'Software',
    image: 'https://via.placeholder.com/300x300?text=Designer+Software',
    features: [
      'Photo editing tools',
      'Vector graphic design',
      'Desktop publishing',
      'Digital painting',
      'Annual license with updates'
    ],
    inStock: true
  },
  {
    name: 'Business Analytics Platform',
    description: 'Powerful software for data analysis and business intelligence.',
    price: 899.99,
    category: 'Software',
    image: 'https://via.placeholder.com/300x300?text=Analytics+Platform',
    features: [
      'Real-time data processing',
      'Advanced reporting tools',
      'Machine learning capabilities',
      'Data visualization',
      'Cloud-based access'
    ],
    inStock: true
  },
  {
    name: 'Network Security Package',
    description: 'Comprehensive security solution for businesses of all sizes.',
    price: 349.99,
    category: 'Service',
    image: 'https://via.placeholder.com/300x300?text=Security+Package',
    features: [
      'Firewall protection',
      'Malware detection',
      'Regular security audits',
      'Incident response',
      '24/7 monitoring'
    ],
    inStock: true
  },
  {
    name: 'Ergonomic Peripherals Set',
    description: 'Complete set of ergonomic keyboard, mouse, and accessories for comfortable work.',
    price: 199.99,
    category: 'Accessory',
    image: 'https://via.placeholder.com/300x300?text=Ergonomic+Set',
    features: [
      'Wireless ergonomic keyboard',
      'Precision mouse',
      'Wrist rest',
      'Monitor stand',
      'Cable management system'
    ],
    inStock: true
  },
  {
    name: 'Premium Audio System',
    description: 'High-fidelity audio setup for professional environments.',
    price: 449.99,
    category: 'Accessory',
    image: 'https://via.placeholder.com/300x300?text=Audio+System',
    features: [
      'Studio-quality speakers',
      'Noise-cancelling headphones',
      'Digital audio interface',
      'Acoustic treatment accessories'
    ],
    inStock: true
  }
];

module.exports = products;
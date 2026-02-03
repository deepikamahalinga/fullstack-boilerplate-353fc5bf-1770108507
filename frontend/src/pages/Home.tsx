import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Statistic {
  value: string;
  label: string;
}

const Home: React.FC = () => {
  const features: Feature[] = [
    {
      title: 'TypeScript Ready',
      description: 'Built with type safety in mind using TypeScript for better development experience',
      icon: '🎯'
    },
    {
      title: 'Clean Architecture',
      description: 'Follows industry best practices with a well-organized project structure',
      icon: '🏗️'
    },
    {
      title: 'Production Ready',
      description: 'Optimized for production with proper error handling and security measures',
      icon: '🚀'
    },
    {
      title: 'Full Stack Solution',
      description: 'Complete integration between React frontend and Node.js backend',
      icon: '⚡'
    }
  ];

  const statistics: Statistic[] = [
    { value: '100%', label: 'Type Safe' },
    { value: '50+', label: 'Components' },
    { value: '99%', label: 'Test Coverage' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Fullstack Boilerplate
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A production-ready full-stack boilerplate application using React and Node.js with TypeScript.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/docs"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/demo"
              className="px-8 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Live Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="p-6 bg-gray-50 rounded-xl"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Entity Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-blue-50 p-8 rounded-2xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">Core Entities</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <Link
                to="/users"
                className="block p-6 bg-white rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className="text-3xl mr-4">👤</div>
                  <div>
                    <h3 className="text-xl font-semibold">User Management</h3>
                    <p className="text-gray-600">
                      Complete user authentication and authorization system
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Home;
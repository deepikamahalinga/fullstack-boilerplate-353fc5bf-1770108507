import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Icon/Illustration */}
        <div className="mb-8">
          <svg
            className="mx-auto h-32 w-32 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          Oops! Page Not Found
        </h2>
        
        {/* Helpful Message */}
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't seem to exist. Here are some helpful links:
        </p>

        {/* Navigation Suggestions */}
        <div className="space-y-4">
          <Link 
            to="/"
            className="block w-full sm:w-auto bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Return Home
          </Link>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link 
              to="/about"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              About Us
            </Link>
            <Link 
              to="/contact"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Contact Support
            </Link>
            <Link 
              to="/sitemap"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Help Text */}
      <p className="mt-12 text-gray-500 text-sm">
        If you believe this is a mistake, please{' '}
        <Link 
          to="/contact"
          className="text-indigo-600 hover:text-indigo-800"
        >
          contact our support team
        </Link>
      </p>
    </div>
  );
};

export default NotFound;
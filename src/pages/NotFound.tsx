import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertTriangle, Home } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <SEO 
        title="Page Not Found" 
        description="The page you requested could not be found. Return to Mentorino's dashboard or home."
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full">
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white/90 mb-6">Page Not Found</h2>
        
        <p className="text-white/60 max-w-md mx-auto mb-10 text-lg">
          The page you are looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>
        
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors"
        >
          <Home className="w-5 h-5" />
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;

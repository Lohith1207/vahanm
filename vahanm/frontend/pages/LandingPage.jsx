import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, User, Shield, TrendingUp, Clock, Star } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <motion.h1 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            Ride Aggregator
          </motion.h1>
          <Button 
            variant="outline" 
            className="text-white border-white hover:bg-white hover:text-gray-900"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Journey, <span className="text-blue-600">Simplified</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience seamless rides with the most advanced ride aggregation platform.
            Choose your role and get started today!
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              hoverable 
              className="p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-500"
              onClick={() => navigate('/signup/customer')}
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="text-blue-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Customer</h3>
              <p className="text-gray-600 mb-6">
                Book rides, track drivers, and enjoy safe journeys
              </p>
              <Button className="w-full">Get Started</Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              hoverable 
              className="p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-500"
              onClick={() => navigate('/signup/driver')}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Driver</h3>
              <p className="text-gray-600 mb-6">
                Accept rides, earn money, and grow your business
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">Get Started</Button>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              hoverable 
              className="p-8 text-center cursor-pointer transform transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-purple-500"
              onClick={() => navigate('/login')}
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-purple-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Admin</h3>
              <p className="text-gray-600 mb-6">
                Manage platform, users, and monitor analytics
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Get Started</Button>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-blue-600" size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Best Rates</h4>
              <p className="text-gray-600">Competitive pricing with transparent fare calculation</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-green-600" size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Quick Booking</h4>
              <p className="text-gray-600">Book rides in seconds with our streamlined process</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-yellow-600" size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Top Rated</h4>
              <p className="text-gray-600">Verified drivers with excellent customer ratings</p>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">© 2026 Ride Aggregator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

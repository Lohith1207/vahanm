import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  Crown, 
  Check, 
  X,
  TrendingUp,
  Star,
  Shield,
  Zap,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Subscriptions = () => {
  const [selectedPlan, setSelectedPlan] = useState('free');

  // Subscription plans
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      commission: 20,
      color: 'gray',
      features: [
        { text: '20% platform commission', included: true },
        { text: 'Standard support', included: true },
        { text: 'Basic ride requests', included: true },
        { text: 'Priority requests', included: false },
        { text: 'Premium support', included: false },
        { text: 'Surge bonus', included: false }
      ]
    },
    {
      id: 'silver',
      name: 'Silver',
      price: 499,
      commission: 15,
      color: 'blue',
      popular: false,
      features: [
        { text: '15% platform commission', included: true },
        { text: 'Priority support', included: true },
        { text: 'Priority ride requests', included: true },
        { text: '1.2x surge bonus', included: true },
        { text: 'Premium support', included: false },
        { text: 'Earnings analytics', included: false }
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 899,
      commission: 10,
      color: 'yellow',
      popular: true,
      features: [
        { text: '10% platform commission', included: true },
        { text: 'Premium support 24/7', included: true },
        { text: 'Priority ride requests', included: true },
        { text: '1.5x surge bonus', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Free vehicle insurance', included: true }
      ]
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 1499,
      commission: 5,
      color: 'purple',
      popular: false,
      features: [
        { text: 'Only 5% commission', included: true },
        { text: 'Dedicated support manager', included: true },
        { text: 'Premium ride requests first', included: true },
        { text: '2x surge bonus', included: true },
        { text: 'Advanced analytics & insights', included: true },
        { text: 'Free vehicle + health insurance', included: true }
      ]
    }
  ];

  const getColorClasses = (color, type = 'bg') => {
    const colors = {
      gray: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', button: 'bg-gray-600' },
      blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', button: 'bg-blue-600' },
      yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', button: 'bg-yellow-600' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', button: 'bg-purple-600' }
    };
    return colors[color]?.[type] || '';
  };

  // Mock current subscription data
  const currentSubscription = {
    plan: 'free',
    startDate: '2024-01-01',
    renewalDate: '2024-03-01',
    savingsThisMonth: 0
  };

  // Calculate potential savings
  const calculateSavings = (plan) => {
    const monthlyEarnings = 28500;
    const currentCommission = (monthlyEarnings * 20) / 100;
    const newCommission = (monthlyEarnings * plan.commission) / 100;
    const savings = currentCommission - newCommission - plan.price;
    return Math.round(savings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Crown className="text-yellow-500" size={32} />
          Subscription Plans
        </h1>
        <p className="text-gray-600">
          Reduce platform commission and unlock premium features
        </p>
      </div>

      {/* Current Plan Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">
              {plans.find(p => p.id === currentSubscription.plan)?.name || 'Free'} Plan
            </p>
            <p className="text-gray-700 mt-2">
              Commission: <strong>{plans.find(p => p.id === currentSubscription.plan)?.commission}%</strong>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">You could save</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{calculateSavings(plans[2])}/mo
            </p>
            <p className="text-xs text-gray-600 mt-1">with Gold plan</p>
          </div>
        </div>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`p-6 relative ${
                plan.popular ? 'border-2 border-yellow-400 shadow-xl' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                    🔥 Most Popular
                  </span>
                </div>
              )}

              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getColorClasses(plan.color, 'bg')}`}>
                {plan.id === 'platinum' && <Crown className={getColorClasses(plan.color, 'text')} size={32} />}
                {plan.id === 'gold' && <Star className={getColorClasses(plan.color, 'text')} size={32} />}
                {plan.id === 'silver' && <Zap className={getColorClasses(plan.color, 'text')} size={32} />}
                {plan.id === 'free' && <Shield className={getColorClasses(plan.color, 'text')} size={32} />}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {plan.name}
              </h3>

              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
                <span className="text-gray-600">/month</span>
              </div>

              <div className={`text-center mb-6 py-2 rounded-lg ${getColorClasses(plan.color, 'bg')}`}>
                <p className={`font-bold ${getColorClasses(plan.color, 'text')}`}>
                  {plan.commission}% Commission
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X size={20} className="text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {plan.price > 0 && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-center">
                    <span className="text-green-700 font-semibold">Save ₹{calculateSavings(plan)}/mo</span>
                  </p>
                </div>
              )}

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full"
                disabled={plan.id === currentSubscription.plan}
              >
                {plan.id === currentSubscription.plan ? 'Current Plan' : 'Upgrade Now'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="text-green-600" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Earn More</h4>
          <p className="text-gray-600 text-sm">
            Lower commission means more money in your pocket from every ride
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-blue-600" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Priority Access</h4>
          <p className="text-gray-600 text-sm">
            Get first preference for premium and long-distance rides
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="text-purple-600" size={32} />
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Extra Bonuses</h4>
          <p className="text-gray-600 text-sm">
            Unlock surge multipliers and exclusive incentive programs
          </p>
        </Card>
      </div>

      {/* FAQ */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</p>
            <p className="text-gray-600 text-sm">
              Yes, you can cancel or downgrade your subscription at any time. Changes take effect from the next billing cycle.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">How is the commission calculated?</p>
            <p className="text-gray-600 text-sm">
              Commission is deducted from each ride fare. For example, on a ₹100 ride with 10% commission, you receive ₹90.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">What payment methods are accepted?</p>
            <p className="text-gray-600 text-sm">
              We accept UPI, credit/debit cards, net banking, and wallet payments. Subscription fees are auto-deducted monthly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

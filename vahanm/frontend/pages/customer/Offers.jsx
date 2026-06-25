import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Gift,
  Star,
  Clock,
  Tag,
  Trophy,
  Zap,
  Calendar,
  TrendingUp,
  Percent
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Offers = () => {
  const [promoCode, setPromoCode] = useState('');

  const coupons = [
    { 
      code: 'FIRST20',
      discount: '20% Off',
      title: 'First Ride',
      description: 'Get 20% off on your first ride with us',
      expires: '3 days left',
      color: 'from-blue-500 to-purple-500',
      maxDiscount: '₹100',
      minOrder: '₹150'
    },
    { 
      code: 'WEEKEND50',
      discount: '₹50 Off',
      title: 'Weekend Special',
      description: 'Enjoy weekend rides with special discount',
      expires: '2 days left',
      color: 'from-green-500 to-teal-500',
      maxDiscount: '₹50',
      minOrder: '₹200'
    },
    { 
      code: 'SAVE100',
      discount: '₹100 Off',
      title: 'Big Save Deal',
      description: 'Save big on rides above ₹500',
      expires: '1 week left',
      color: 'from-orange-500 to-red-500',
      maxDiscount: '₹100',
      minOrder: '₹500'
    },
    { 
      code: 'STUDENT25',
      discount: '25% Off',
      title: 'Student Discount',
      description: 'Special offer for students',
      expires: '10 days left',
      color: 'from-purple-500 to-pink-500',
      maxDiscount: '₹75',
      minOrder: '₹100'
    },
    { 
      code: 'LOYAL200',
      discount: '₹200 Off',
      title: 'Loyalty Reward',
      description: 'Thank you for being a loyal customer',
      expires: '5 days left',
      color: 'from-yellow-500 to-orange-500',
      maxDiscount: '₹200',
      minOrder: '₹1000'
    },
    { 
      code: 'SHARE15',
      discount: '15% Off',
      title: 'Refer & Earn',
      description: 'Get discount when you refer friends',
      expires: '2 weeks left',
      color: 'from-cyan-500 to-blue-500',
      maxDiscount: '₹60',
      minOrder: '₹120'
    }
  ];

  const specialOffers = [
    {
      title: 'Daily Streak',
      description: 'Ride daily and get increasing discounts',
      currentDay: 3,
      maxDay: 7,
      reward: 'Up to 30% off',
      icon: Calendar
    },
    {
      title: 'Peak Hours',
      description: 'Avoid rush and get discounts',
      time: '10 AM - 4 PM',
      reward: '10% off',
      icon: Clock
    },
    {
      title: 'Green Rides',
      description: 'Choose eco-friendly rides',
      reward: '5% off + Green points',
      icon: Zap
    }
  ];

  const rewardPoints = {
    current: 1250,
    nextReward: 2000,
    progress: 62
  };

  const handleApplyCode = () => {
    if (promoCode.trim()) {
      alert(`Promo code "${promoCode}" applied! (This would integrate with your booking system)`);
      setPromoCode('');
    }
  };

  const handleCouponCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Coupon code "${code}" copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Gift className="text-pink-600" size={36} />
          Special Offers & Deals
        </h1>
        <p className="text-gray-600">Save more on every ride with exclusive offers</p>
      </div>

      {/* Promo Code Input */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="text-blue-600" size={24} />
          Have a Promo Code?
        </h2>
        <div className="flex gap-4">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button onClick={handleApplyCode} className="px-8">
            Apply
          </Button>
        </div>
      </Card>

      {/* Rewards Points */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy size={24} />
            Reward Points
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold">{rewardPoints.current}</p>
            <p className="text-sm opacity-90">points</p>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to next reward</span>
            <span>{rewardPoints.nextReward - rewardPoints.current} points to go</span>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-300"
              style={{ width: `${rewardPoints.progress}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-sm opacity-90">
          Earn 1 point for every ₹10 spent • Redeem 100 points = ₹10 off
        </p>
      </Card>

      {/* Special Offers */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="text-yellow-600" size={24} />
          Special Programs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specialOffers.map((offer, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-5 h-full">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <offer.icon className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{offer.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                  </div>
                </div>
                
                {offer.currentDay && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Day {offer.currentDay} of {offer.maxDay}</span>
                      <span>{offer.maxDay - offer.currentDay} days left</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${(offer.currentDay / offer.maxDay) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {offer.time && (
                  <p className="text-xs text-gray-600 mb-3">Valid: {offer.time}</p>
                )}
                
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-700">{offer.reward}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coupons Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Percent className="text-pink-600" size={24} />
          Available Coupons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className={`p-6 bg-gradient-to-r ${coupon.color} text-white cursor-pointer relative overflow-hidden`}>
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gift size={20} />
                      <span className="text-sm font-semibold bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        {coupon.expires}
                      </span>
                    </div>
                    <Clock size={16} className="opacity-75" />
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-1">{coupon.discount}</h4>
                  <p className="text-lg font-semibold mb-2">{coupon.title}</p>
                  <p className="text-sm mb-4 opacity-90">{coupon.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span>Max Discount:</span>
                      <span className="font-semibold">{coupon.maxDiscount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Min Order:</span>
                      <span className="font-semibold">{coupon.minOrder}</span>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm cursor-pointer hover:bg-opacity-30 transition-all"
                    onClick={() => handleCouponCopy(coupon.code)}
                  >
                    <p className="text-sm font-bold text-center">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-center opacity-75 mt-1">Tap to copy</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Terms & Conditions</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Offers are valid for a limited time and subject to availability</li>
          <li>• Only one coupon can be applied per booking</li>
          <li>• Coupons cannot be combined with other offers</li>
          <li>• Minimum order value must be met to use the coupon</li>
          <li>• Refund will be processed as per the original payment method</li>
          <li>• Company reserves the right to modify or cancel offers</li>
        </ul>
      </Card>
    </div>
  );
};
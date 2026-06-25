import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatsCard } from '../../components/common/StatsCard';
import {
  DollarSign,
  TrendingUp,
  Star,
  Navigation,
  Calendar,
  Clock,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export const DriverEarnings = () => {
  const [timeframe, setTimeframe] = useState('daily'); // daily or monthly

  // Mock earnings data
  const dailyEarnings = {
    today: 1250,
    yesterday: 980,
    thisWeek: 6840,
    rides: 12,
    hours: 8.5,
    distance: 142
  };

  const monthlyEarnings = {
    thisMonth: 28500,
    lastMonth: 25400,
    thisYear: 185000,
    rides: 340,
    days: 22,
    distance: 4250
  };

  const currentData = timeframe === 'daily' ? dailyEarnings : monthlyEarnings;

  // Mock daily earnings chart data (last 7 days)
  const dailyChartData = [
    { day: 'Mon', amount: 980 },
    { day: 'Tue', amount: 1120 },
    { day: 'Wed', amount: 890 },
    { day: 'Thu', amount: 1450 },
    { day: 'Fri', amount: 1680 },
    { day: 'Sat', amount: 1970 },
    { day: 'Sun', amount: 1250 }
  ];

  // Mock monthly earnings chart data (last 6 months)
  const monthlyChartData = [
    { month: 'Sep', amount: 22500 },
    { month: 'Oct', amount: 24800 },
    { month: 'Nov', amount: 23200 },
    { month: 'Dec', amount: 26900 },
    { month: 'Jan', amount: 25400 },
    { month: 'Feb', amount: 28500 }
  ];

  const chartData = timeframe === 'daily' ? dailyChartData : monthlyChartData;
  const maxAmount = Math.max(...chartData.map(d => d.amount));

  // Ratings breakdown
  const ratingsBreakdown = [
    { stars: 5, count: 280, percentage: 82 },
    { stars: 4, count: 45, percentage: 13 },
    { stars: 3, count: 12, percentage: 4 },
    { stars: 2, count: 2, percentage: 1 },
    { stars: 1, count: 1, percentage: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Timeframe Toggle */}
      <div className="flex gap-3">
        <Button
          variant={timeframe === 'daily' ? 'primary' : 'outline'}
          onClick={() => setTimeframe('daily')}
        >
          Daily
        </Button>
        <Button
          variant={timeframe === 'monthly' ? 'primary' : 'outline'}
          onClick={() => setTimeframe('monthly')}
        >
          Monthly
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={timeframe === 'daily' ? "Today's Earnings" : "This Month"}
          value={`₹${timeframe === 'daily' ? currentData.today : currentData.thisMonth}`}
          icon={DollarSign}
          trend="up"
          trendValue="12%"
          color="green"
        />
        <StatsCard
          title="Total Rides"
          value={currentData.rides}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Distance"
          value={`${currentData.distance} km`}
          icon={Navigation}
          trend="up"
          trendValue="8%"
          color="purple"
        />
        <StatsCard
          title="Avg Rating"
          value="4.8"
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Earnings Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={24} />
            {timeframe === 'daily' ? 'Last 7 Days' : 'Last 6 Months'}
          </h3>
          <span className="text-2xl font-bold text-green-600">
            ₹{timeframe === 'daily' ? dailyEarnings.thisWeek : monthlyEarnings.thisYear}
          </span>
        </div>

        <div className="h-64 flex items-end gap-2 md:gap-4">
          {chartData.map((item, index) => {
            const height = (item.amount / maxAmount) * 100;
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg relative group cursor-pointer"
              >
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₹{item.amount}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-between mt-4 text-sm text-gray-600">
          {chartData.map((item, index) => (
            <span key={index} className="flex-1 text-center">
              {item.day || item.month}
            </span>
          ))}
        </div>
      </Card>

      {/* Earnings Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detailed Stats */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            Detailed Stats
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total {timeframe === 'daily' ? 'Hours' : 'Days'}</span>
              <span className="font-bold text-gray-900">
                {timeframe === 'daily' ? `${currentData.hours} hrs` : `${currentData.days} days`}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Distance Covered</span>
              <span className="font-bold text-gray-900">{currentData.distance} km</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Avg per Ride</span>
              <span className="font-bold text-green-600">
                ₹{Math.round((timeframe === 'daily' ? currentData.today : currentData.thisMonth) / currentData.rides)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Avg per KM</span>
              <span className="font-bold text-green-600">
                ₹{Math.round((timeframe === 'daily' ? currentData.today : currentData.thisMonth) / currentData.distance)}
              </span>
            </div>
            {timeframe === 'daily' && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg per Hour</span>
                <span className="font-bold text-green-600">
                  ₹{Math.round(currentData.today / currentData.hours)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-600" size={20} />
              <span className="font-semibold text-gray-900">Performance</span>
            </div>
            <p className="text-sm text-gray-700">
              You're earning <strong>12% more</strong> than last {timeframe === 'daily' ? 'week' : 'month'}! Keep up the great work! 🎉
            </p>
          </div>
        </Card>

        {/* Ratings Breakdown */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="text-yellow-600" size={24} />
            Rating Breakdown
          </h3>

          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">4.8</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  className={star <= 4.8 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <p className="text-gray-600">Based on 340 rides</p>
          </div>

          <div className="space-y-3">
            {ratingsBreakdown.map((rating) => (
              <div key={rating.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-semibold text-gray-900">{rating.stars}</span>
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rating.percentage}%` }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{rating.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>82%</strong> of your rides received 5-star ratings! Excellent service! ⭐
            </p>
          </div>
        </Card>
      </div>

      {/* Earnings Tips */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
          💡 Earnings Tips
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Peak hours (8-10 AM, 5-8 PM) have 1.5-2x surge pricing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Maintain 4.5+ rating to access premium ride requests</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Complete 50+ rides/month to unlock bonus incentives</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

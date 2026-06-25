import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { paymentAPI, authAPI } from '../../services/api';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Payments = () => {
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch balance and history
  const loadPaymentData = async () => {
    try {
      const userRes = await authAPI.getCurrentUser();
      if (userRes.data?.data) {
        setWalletBalance(userRes.data.data.walletBalance || 0);
      }

      const histRes = await paymentAPI.getHistory();
      if (histRes.data?.data) {
        setTransactions(histRes.data.data);
      }
    } catch (e) {
      console.error('Failed to load payment data', e);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  const handleAddMoney = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setIsLoading(true);
    try {
      // 1. Create Order
      const { data } = await paymentAPI.createOrder({ amount: Number(amount) });
      const order = data.data;

      // 2. Open Razorpay Widget
      const options = {
        key: order.keyId, // RAZORPAY_KEY passed from backend
        amount: order.amount * 100, // Amount is in currency subunits
        currency: 'INR',
        name: 'Vahanm Wallet',
        description: 'Add Money to Wallet',
        order_id: order.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            alert('Payment Successful!');
            setShowAddMoney(false);
            setAmount('');
            setWalletBalance(verifyRes.data.data.walletBalance);
            loadPaymentData(); // Refresh history
          } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: '#3B82F6'
        }
      };

      if (!window.Razorpay) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setIsLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment Failed: ' + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error('Error initiating payment', error);
      alert('Payment service unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold">₹{walletBalance.toFixed(2)}</h2>
          </div>
          <Wallet size={48} className="text-blue-200" />
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-green-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <span className="text-sm font-medium text-gray-600">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{transactions.reduce((acc, t) => t.status === 'SUCCESS' ? acc + t.amount : acc, 0).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{transactions.length} transactions</p>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-gray-100 flex items-center gap-4 bg-gray-50 text-gray-400 cursor-not-allowed">
            <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xs">
              VISA
            </div>
            <div>
              <p className="font-semibold">VISA **** 4532</p>
              <p className="text-xs">Expires 12/26</p>
            </div>
          </Card>

          <Card className="p-4 border border-gray-100 flex items-center gap-4 bg-gray-50 text-gray-400 cursor-not-allowed">
            <div className="w-12 h-8 bg-orange-100 rounded flex items-center justify-center text-orange-600 font-bold text-xs">
              MC
            </div>
            <div>
              <p className="font-semibold">MasterCard **** 8976</p>
              <p className="text-xs">Expires 08/25</p>
            </div>
          </Card>

          <Card
            hoverable
            className="p-4 border-2 border-transparent hover:border-blue-500 cursor-pointer flex items-center gap-4 transition-all group"
            onClick={() => setShowAddMoney(true)}
          >
            <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
                alt="Razorpay"
                className="h-4 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden text-blue-600 font-bold text-xs">RZP</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Razorpay Payment</p>
              <p className="text-xs text-gray-500">Add balance instantly</p>
            </div>
            <ArrowUpRight size={18} className="text-gray-400 group-hover:text-blue-600" />
          </Card>

          <Card className="p-4 border border-gray-100 flex items-center gap-4 bg-gray-50 text-gray-400 cursor-not-allowed">
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-500 font-bold text-xs">
              PayPal
            </div>
            <div>
              <p className="font-semibold">PayPal Payment</p>
              <p className="text-xs">Not connected</p>
            </div>
          </Card>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        </div>

        <div className="space-y-3">
          {transactions.map((txn, index) => (
            <motion.div
              key={txn.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${txn.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                      {txn.status === 'SUCCESS' ? (
                        <ArrowDownLeft className="text-green-600" size={20} />
                      ) : (
                        <ArrowUpRight className="text-red-600" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Wallet Recharge</p>
                      <p className="text-sm text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${txn.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {txn.status === 'SUCCESS' ? '+' : ''}₹{txn.amount}
                    </p>
                    <span className="text-xs text-gray-500 capitalize">{txn.status}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          {transactions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>
          )}
        </div>
      </Card>

      {/* Add Money Modal */}
      <Modal
        isOpen={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        title="Add Money to Wallet"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Enter Amount"
            placeholder="₹ 0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={DollarSign}
          />

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Quick Select</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="py-2 px-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors font-semibold text-gray-700"
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleAddMoney}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Add ₹${amount || '0'} to Wallet`}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

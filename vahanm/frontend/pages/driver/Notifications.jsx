import { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  Bell, 
  MessageSquare, 
  Phone, 
  Mail,
  Bot,
  User,
  Send,
  AlertCircle,
  CheckCircle,
  Info,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DriverNotifications = () => {
  const [activeTab, setActiveTab] = useState('notifications'); // notifications or support
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! I\'m your AI support assistant. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'earning',
      icon: CheckCircle,
      color: 'green',
      title: 'Earnings Credited',
      message: '₹1,250 has been credited to your account',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'document',
      icon: AlertCircle,
      color: 'yellow',
      title: 'Document Expiring Soon',
      message: 'Your vehicle insurance expires in 10 days',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      icon: Info,
      color: 'blue',
      title: 'New Feature Available',
      message: 'QR payment collection is now available',
      time: '1 day ago',
      read: true
    },
    {
      id: 4,
      type: 'rating',
      icon: CheckCircle,
      color: 'green',
      title: '5-Star Rating Received',
      message: 'John Doe rated you 5 stars with positive feedback',
      time: '1 day ago',
      read: true
    },
    {
      id: 5,
      type: 'promo',
      icon: Info,
      color: 'purple',
      title: 'Special Bonus',
      message: 'Complete 20 rides this week for ₹500 bonus',
      time: '2 days ago',
      read: true
    }
  ];

  // AI Support
  const quickQuestions = [
    'How do I increase my earnings?',
    'Document verification status?',
    'How to handle cancellations?',
    'Subscription plans comparison'
  ];

  const faqs = [
    {
      question: 'How do I get more ride requests?',
      answer: 'Stay online during peak hours (8-10 AM, 5-8 PM), maintain a high rating (4.5+), and consider upgrading to a premium subscription for priority requests.'
    },
    {
      question: 'What happens if I cancel a ride?',
      answer: 'Excessive cancellations can affect your rating and reduce future ride requests. Try to accept only rides you can complete.'
    },
    {
      question: 'How long does document verification take?',
      answer: 'Document verification typically takes 24-48 hours. Ensure all documents are clear and valid.'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: getBotResponse(inputMessage)
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('earning') || lowerMessage.includes('money')) {
      return 'To increase your earnings: 1) Stay online during peak hours, 2) Maintain high ratings, 3) Consider subscription plans with lower commission rates. Would you like details on our subscription plans?';
    } else if (lowerMessage.includes('document') || lowerMessage.includes('verification')) {
      return 'You can check your document verification status in the Vehicle Management section. Documents typically take 24-48 hours to verify. Need help uploading documents?';
    } else if (lowerMessage.includes('cancellation') || lowerMessage.includes('cancel')) {
      return 'Try to minimize cancellations as they affect your rating. If you must cancel, do it immediately so the customer can find another ride quickly. Excessive cancellations may limit your ride requests.';
    } else if (lowerMessage.includes('subscription') || lowerMessage.includes('plan')) {
      return 'We offer 4 subscription plans: Free (20%), Silver (15%), Gold (10%), and Platinum (5%) commission. Premium plans also include priority requests and surge bonuses. Check the Subscriptions section for detailed comparison!';
    } else {
      return 'I understand your question. For detailed assistance, please contact our support team at 1800-123-4567 or email driver-support@rideapp.com. Is there anything specific I can help you with regarding earnings, documents, or subscriptions?';
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-3">
        <Button
          variant={activeTab === 'notifications' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('notifications')}
          className="flex-1"
        >
          <Bell size={18} />
          Notifications
        </Button>
        <Button
          variant={activeTab === 'support' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('support')}
          className="flex-1"
        >
          <MessageSquare size={18} />
          AI Support
        </Button>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Notifications
            </h3>
            <Button variant="ghost" size="sm">
              Mark all as read
            </Button>
          </div>

          {notifications.map((notification, index) => {
            const IconComponent = notification.icon;
            const colorClasses = {
              green: 'bg-green-100 text-green-600',
              yellow: 'bg-yellow-100 text-yellow-600',
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600'
            };

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-4 ${!notification.read ? 'border-l-4 border-blue-500 bg-blue-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses[notification.color]}`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* AI Support Tab */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card hoverable className="p-4 text-center cursor-pointer">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="text-green-600" size={24} />
              </div>
              <p className="font-semibold text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-600 mt-1">Available 24/7</p>
            </Card>

            <Card hoverable className="p-4 text-center cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="text-blue-600" size={24} />
              </div>
              <p className="font-semibold text-gray-900">Call Support</p>
              <p className="text-sm text-gray-600 mt-1">1800-123-4567</p>
            </Card>

            <Card hoverable className="p-4 text-center cursor-pointer">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="text-purple-600" size={24} />
              </div>
              <p className="font-semibold text-gray-900">Email Us</p>
              <p className="text-sm text-gray-600 mt-1">driver-support@rideapp.com</p>
            </Card>
          </div>

          {/* AI Chat */}
          <Card className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg -m-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Bot className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg">AI Support Assistant</p>
                  <p className="text-sm opacity-90">Always here to help</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto mb-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'bot' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {message.type === 'bot' ? (
                        <Bot className="text-white" size={16} />
                      ) : (
                        <User className="text-white" size={16} />
                      )}
                    </div>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'bot' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send size={18} />
              </Button>
            </div>
          </Card>

          {/* FAQs */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="pb-4 border-b last:border-b-0">
                  <p className="font-semibold text-gray-900 mb-2">{faq.question}</p>
                  <p className="text-gray-700 text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

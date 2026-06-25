import { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal'; // Import Modal
import { customerAPI } from '../../services/api';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Clock,
  Loader2,
  Plus,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate a unique session ID for the chat
const generateSessionId = () => {
  return `customer-${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

export const Support = () => {
  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your AI support assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef(null);

  // Ticket State
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTicketDetailOpen, setIsTicketDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'ride_issue', description: '', priority: 'medium' });
  const [createLoading, setCreateLoading] = useState(false);

  // Initial Data
  const quickQuestions = [
    'Where is my driver?',
    'How to cancel a ride?',
    'Refund status',
    'Update payment method',
    'Safety concerns',
    'Lost item'
  ];

  const faqs = [
    {
      question: 'How do I cancel a ride?',
      answer: 'You can cancel a ride from the ride tracking page. Cancellation charges may apply based on timing.'
    },
    {
      question: 'How long does refund take?',
      answer: 'Refunds are typically processed within 5-7 business days to your original payment method.'
    },
    {
      question: 'How to add a payment method?',
      answer: 'Go to Payments page, click on "Add New" under Payment Methods section.'
    }
  ];

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setTicketsLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      const currentUserId = user.id || user._id;

      const { data } = await customerAPI.getSupportTickets(currentUserId);
      // Ensure specific structure mapping if needed, but usually API returns { tickets: [...] }
      // Adjust based on your actual API response structure for 'get_support_tickets' (admin) vs 'get_customer_tickets'
      // My customer endpoint returns list of tickets directly or { tickets: [...] } ?
      // Let's assume it returns { tickets: [...] } based on admin endpoint pattern, 
      // but 'customer.py' actually returns list directly in my implementation?
      // Wait, let me check 'customer.py' implementation again.
      // It returns `[{...}, {...}]` (List[Dict]) or `{"tickets": [...]}`?
      // "return { 'tickets': [...] }" is what I should have done.
      // Actually 'customer.py' code snippet showed:
      // @router.get("/support/tickets") ... return [ticket for ticket in tickets] ...
      // If it returns a list directly, `data` is the list.
      // If it returns object, `data.tickets` is the list.
      // I'll handle both cases to be safe.
      // The backend returns an ApiResponse object where the tickets are usually in data.data
      const ticketsList = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : (data?.tickets || []));
      setTickets(ticketsList);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userId = userObj ? (userObj.id || userObj._id) : null;

      // Send message to the Java AI Support backend
      const response = await customerAPI.sendSupportChatMessage({ message: currentMessage, userId });

      const aiResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error connecting to AI Assistant:', error);
      const fallbackMsg = error.response?.data?.response || "I apologize, but my AI system is currently experiencing issues connecting to the brain. Please try again later.";
      const errorResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: fallbackMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      alert('Please fill in required fields');
      return;
    }

    setCreateLoading(true);
    try {
      await customerAPI.createSupportTicket(newTicket);
      setIsCreateModalOpen(false);
      setNewTicket({ subject: '', category: 'ride_issue', description: '', priority: 'medium' });
      await fetchTickets();
      alert('Ticket created successfully!');
    } catch (err) {
      console.error('Error creating ticket:', err);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>
          <p className="text-gray-600">Get help with your rides and account</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Raise Ticket
        </Button>
      </div>

      {/* Support Tickets Section */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="text-purple-600" size={24} />
          Your Support Tickets
        </h3>

        {ticketsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto text-purple-600" size={32} />
            <p className="mt-2 text-gray-500">Loading tickets...</p>
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id || ticket._id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setIsTicketDetailOpen(true);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>ID: #{String(ticket.id || ticket._id).slice(-6)}</span>
                      <span>•</span>
                      <span>{formatDate(ticket.createdAt || ticket.created_at)}</span>
                      <span>•</span>
                      <span className="capitalize">{ticket.category ? ticket.category.replace('_', ' ') : 'General'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(ticket.status)}`}>
                      {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageSquare size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No support tickets found</p>
            <Button variant="ghost" className="mt-2" onClick={() => setIsCreateModalOpen(true)}>
              create one now
            </Button>
          </div>
        )}
      </Card>

      {/* Contact Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hoverable className="p-6 text-center cursor-pointer">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-blue-600" size={32} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600">Chat with AI support</p>
          <p className="text-xs text-green-600 font-semibold mt-2">● Available 24/7</p>
        </Card>

        <Card hoverable className="p-6 text-center cursor-pointer">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="text-green-600" size={32} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Call Support</h3>
          <p className="text-sm text-gray-600">1800-123-4567</p>
          <p className="text-xs text-gray-500 mt-2">Mon-Sun: 24 hours</p>
        </Card>

        <Card hoverable className="p-6 text-center cursor-pointer">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-purple-600" size={32} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
          <p className="text-sm text-gray-600">support@rideapp.com</p>
          <p className="text-xs text-gray-500 mt-2">Response in 24 hours</p>
        </Card>
      </div>

      {/* AI Chat Interface */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bot className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold">AI Support Assistant</h3>
              <p className="text-sm text-blue-100">● Online - Usually replies instantly</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-80 overflow-y-auto p-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 mb-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'bot' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                  {message.type === 'bot' ? <Bot className="text-blue-600" size={18} /> : <User className="text-green-600" size={18} />}
                </div>

                <div className={`max-w-xs lg:max-w-md ${message.type === 'user' ? 'items-end' : ''}`}>
                  <div className={`p-3 rounded-lg ${message.type === 'bot'
                    ? 'bg-white border border-gray-200'
                    : 'bg-blue-600 text-white'
                    }`}>
                    <p className="text-sm">{message.text}</p>
                    <span className={`text-xs ${message.type === 'bot' ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                      {message.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="p-4 bg-white border-t border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question) => (
              <button
                key={question}
                onClick={() => handleQuickQuestion(question)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isChatLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isChatLoading}
              className={isChatLoading ? 'opacity-75' : ''}
            >
              {isChatLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </Button>
          </div>
        </div>
      </Card>

      {/* FAQs */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle className="text-blue-600" size={24} />
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} hoverable className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                {faq.question}
              </h4>
              <p className="text-sm text-gray-600 ml-6">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Raise Support Ticket"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
            <Input
              placeholder="Brief summary of issue"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              >
                <option value="ride_issue">Ride Issue</option>
                <option value="payment">Payment</option>
                <option value="driver_complaint">Driver Complaint</option>
                <option value="app_issue">App Issue</option>
                <option value="lost_item">Lost Item</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
              placeholder="Please describe your issue in detail..."
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTicket} disabled={createLoading}>
              {createLoading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Ticket'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={isTicketDetailOpen}
        onClose={() => setIsTicketDetailOpen(false)}
        title={selectedTicket ? `Ticket #${String(selectedTicket.id || selectedTicket._id).slice(-8)}` : 'Ticket Details'}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(selectedTicket.status)}`}>
                {selectedTicket.status === 'in-progress' ? 'In Progress' : selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <p className="font-medium text-gray-900 capitalize">{selectedTicket.category.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-gray-500">Date Created:</span>
                <p className="font-medium text-gray-900">{formatDate(selectedTicket.createdAt || selectedTicket.created_at)}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm font-semibold text-gray-700 block mb-2">Description</span>
              <p className="text-gray-800 whitespace-pre-line">{selectedTicket.description}</p>
            </div>

            {selectedTicket.status === 'resolved' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="flex items-center gap-2 text-green-800 font-bold mb-3">
                  <CheckCircle size={18} />
                  Resolution Information
                </h4>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-green-700 uppercase block mb-1">Action Taken</span>
                    <p className="text-green-900 text-sm">{selectedTicket.action_taken || 'No details provided'}</p>
                  </div>

                  {selectedTicket.investigation_notes && (
                    <div className="pt-2 border-t border-green-200">
                      <span className="text-xs font-bold text-green-700 uppercase block mb-1">Additional Notes</span>
                      <p className="text-green-900 text-sm">{selectedTicket.investigation_notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-green-700 pt-2 flex items-center gap-1">
                    <Clock size={12} />
                    Resolved on {formatDate(selectedTicket.resolvedAt || selectedTicket.resolved_at)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsTicketDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal'; // Import Modal
import { adminAPI } from '../../services/api';
import { 
  MessageSquare, 
  Search, 
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Phone,
  FileText,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SupportTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedTicket, setExpandedTicket] = useState(null);
  
  // API state
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolveData, setResolveData] = useState({ action_taken: '', investigation_notes: '' });

  // Fetch tickets from API
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filterStatus === 'all' ? undefined : filterStatus;
      const { data } = await adminAPI.getSupportTickets(statusParam);
      setTickets(data.tickets || []);
      setCounts(data.counts || { total: 0, open: 0, in_progress: 0, resolved: 0 });
    } catch (err) {
      console.error('Error fetching tickets:', err);
      // More specific error message if 403
      if (err.response && err.response.status === 403) {
        setError('Access denied. Please log in as an administrator.');
      } else {
        setError('Failed to fetch support tickets. Please try again.');
      }
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  // Filter tickets by search term
  const filteredTickets = tickets.filter(ticket => {
    const term = searchTerm.toLowerCase();
    return (
      (ticket.subject || '').toLowerCase().includes(term) ||
      (ticket.customer_name || '').toLowerCase().includes(term) ||
      (ticket.id || '').toLowerCase().includes(term) ||
      (ticket.customer_phone || '').includes(term)
    );
  });

  // Handle status update (for non-resolve actions)
  const handleUpdateTicket = async (ticketId, updateData) => {
    setActionLoading(ticketId);
    try {
      await adminAPI.updateTicket(ticketId, updateData);
      await fetchTickets();
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Failed to update ticket');
    } finally {
      setActionLoading(null);
    }
  };

  // Open resolve modal
  const openResolveModal = (ticket) => {
    setSelectedTicket(ticket);
    setResolveData({ action_taken: '', investigation_notes: '' });
    setIsResolveModalOpen(true);
  };

  // Submit resolution
  const handleResolveSubmit = async () => {
    if (!selectedTicket) return;
    
    if (!resolveData.action_taken.trim() || !resolveData.investigation_notes.trim()) {
      alert('Please fill in both Action Taken and Investigation Notes');
      return;
    }

    setActionLoading(selectedTicket.id);
    try {
      await adminAPI.resolveTicket(selectedTicket.id, resolveData.action_taken, resolveData.investigation_notes);
      setIsResolveModalOpen(false);
      await fetchTickets();
    } catch (err) {
      console.error('Error resolving ticket:', err);
      alert('Failed to resolve ticket');
    } finally {
      setActionLoading(null);
      setSelectedTicket(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700 border-red-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={32} />
            Support Tickets
          </h1>
          <p className="text-gray-600 mt-1">Manage and resolve customer support requests</p>
        </div>
        <Button onClick={fetchTickets} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{counts.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Tickets</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{counts.open}</p>
            <p className="text-sm text-gray-600 mt-1">Open</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{counts.in_progress}</p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{counts.resolved}</p>
            <p className="text-sm text-gray-600 mt-1">Resolved</p>
          </div>
        </Card>
      </div>

      {/* Error message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </p>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search by ID, customer name, phone, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <Card className="p-8 text-center">
          <RefreshCw size={32} className="animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && filteredTickets.length === 0 && (
        <Card className="p-8 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No tickets found</h3>
          <p className="text-gray-500 mt-2">
            {searchTerm ? 'Try a different search term' : 'No support tickets found matching your criteria'}
          </p>
        </Card>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-gray-700">#{ticket.id.slice(-8)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                    {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">
                    {ticket.category.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{ticket.subject}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{ticket.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{ticket.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                >
                  {expandedTicket === ticket.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {expandedTicket === ticket.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t pt-4 mt-2 space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                        <FileText size={16} className="text-blue-600" />
                        Details
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{ticket.description}</p>
                    </div>

                    {/* Resolution Info if available */}
                    {ticket.status === 'resolved' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-3">
                          <CheckCircle size={16} />
                          Resolution Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold text-green-700 uppercase">Action Taken</p>
                            <p className="text-sm text-green-900">{ticket.action_taken}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-700 uppercase">Investigation Notes</p>
                            <p className="text-sm text-green-900">{ticket.investigation_notes}</p>
                          </div>
                          <div className="text-xs text-green-700 pt-2 border-t border-green-200 mt-2">
                            Resolved on {formatDate(ticket.resolved_at)} by Admin
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap pt-2 border-t">
                      {ticket.status !== 'resolved' && (
                        <Button 
                          variant="success" 
                          onClick={() => openResolveModal(ticket)}
                          disabled={actionLoading === ticket.id}
                        >
                          <CheckCircle size={16} className="mr-2" />
                          Resolve Ticket
                        </Button>
                      )}
                      
                      {ticket.status === 'open' && (
                        <Button 
                          variant="warning" 
                          onClick={() => handleUpdateTicket(ticket.id, { status: 'in-progress' })}
                          disabled={actionLoading === ticket.id}
                        >
                          <Activity size={16} className="mr-2" />
                          Mark In Progress
                        </Button>
                      )}
                      
                      {ticket.status === 'resolved' && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleUpdateTicket(ticket.id, { status: 'open' })}
                          disabled={actionLoading === ticket.id}
                        >
                          Reopen Ticket
                        </Button>
                      )}
                      
                      {/* Priority Toggle */}
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-gray-500">Priority:</span>
                        <select 
                          className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={ticket.priority}
                          onChange={(e) => handleUpdateTicket(ticket.id, { priority: e.target.value })}
                          disabled={actionLoading === ticket.id}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Resolution Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Ticket"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg border mb-4">
            <p className="text-sm font-semibold text-gray-700">Subject: {selectedTicket?.subject}</p>
            <p className="text-sm text-gray-600 mt-1 truncate">Customer: {selectedTicket?.customer_name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Taken <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Describe the action you took to resolve this issue..."
              value={resolveData.action_taken}
              onChange={(e) => setResolveData({ ...resolveData, action_taken: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investigation Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Internal notes about the investigation..."
              value={resolveData.investigation_notes}
              onChange={(e) => setResolveData({ ...resolveData, investigation_notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="ghost" 
              onClick={() => setIsResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="success"
              onClick={handleResolveSubmit}
              disabled={!resolveData.action_taken.trim() || !resolveData.investigation_notes.trim()}
            >
              Confirm Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { customerAPI } from '../../services/api';
import { Shield, MapPin, AlertTriangle, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Safety = () => {
  const [activeTab, setActiveTab] = useState('report'); // 'report' or 'history'
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'accident',
    description: '',
    location: '',
    severity: 'medium'
  });

  const incidentTypes = [
    { value: 'accident', label: 'Accident' },
    { value: 'harassment', label: 'Harassment/Misconduct' },
    { value: 'driving_behavior', label: 'Unsafe Driving' },
    { value: 'other', label: 'Other Issue' }
  ];

  const fetchReports = async () => {
    try {
      const { data } = await customerAPI.getSafetyReports();
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchReports();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customerAPI.reportSafetyIncident(formData);
      alert('Safety incident reported. Our team will investigate immediately.');
      setFormData({ type: 'accident', description: '', location: '', severity: 'medium' });
      setActiveTab('history');
    } catch (error) {
      console.error(error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'investigating': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 rounded-full">
          <Shield className="text-red-600" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Center</h1>
          <p className="text-gray-600">Report incidents and track their resolution</p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
        <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
        <div>
          <h3 className="font-bold text-red-700">In case of emergency</h3>
          <p className="text-red-600 text-sm">
            If you are in immediate danger, please contact local emergency services (911/100) immediately. 
            This form is for reporting incidents to our safety team.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative ${
            activeTab === 'report' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Report Incident
          {activeTab === 'report' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-6 font-medium text-sm transition-colors relative ${
            activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Reports
          {activeTab === 'history' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'report' ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {incidentTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <span className="font-medium block">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <Input
                      required
                      placeholder="e.g. Near Central Station, Main Road"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Please describe what happened in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="px-8">
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {reports.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No safety reports found.</p>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="p-0 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(report.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-400">ID: {report.id.slice(-6)}</span>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {incidentTypes.find(t => t.value === report.type)?.label || report.type}
                      </h3>
                      <p className="text-gray-600 mt-1">{report.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} />
                      {report.location}
                    </div>

                    {report.admin_reply && (
                      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <MessageSquare className="text-blue-600 shrink-0 mt-1" size={18} />
                          <div>
                            <p className="text-sm font-bold text-blue-800 mb-1">Admin Response</p>
                            <p className="text-blue-700 text-sm">{report.admin_reply}</p>
                            {report.resolved_at && (
                              <p className="text-xs text-blue-500 mt-2">
                                Resolved on {new Date(report.resolved_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

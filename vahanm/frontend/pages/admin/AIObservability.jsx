import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { 
  Activity, 
  Zap, 
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const AIObservability = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="text-purple-600" size={32} />
          AI Observability Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Monitor AI/ML model performance and LLM traces</p>
      </div>

      {/* Integration Status */}
      <Card className="p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="text-center">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="text-white" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">LangSmith Integration</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Connect your LangSmith account to monitor AI chatbot performance, trace LLM calls, 
            analyze token usage, and debug prompt chains in real-time.
          </p>
          <Button variant="primary" size="lg">
            <Zap size={20} />
            Connect LangSmith Account
          </Button>
        </div>
      </Card>

      {/* Placeholder Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 opacity-50">
          <div className="flex items-center justify-between mb-4">
            <Activity className="text-blue-600" size={32} />
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-400">--</p>
          <p className="text-gray-500 mt-2">Total AI Requests</p>
        </Card>

        <Card className="p-6 opacity-50">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-purple-600" size={32} />
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-400">-- ms</p>
          <p className="text-gray-500 mt-2">Avg Response Time</p>
        </Card>

        <Card className="p-6 opacity-50">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="text-green-600" size={32} />
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-400">$--</p>
          <p className="text-gray-500 mt-2">Token Cost (Month)</p>
        </Card>

        <Card className="p-6 opacity-50">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <p className="text-3xl font-bold text-gray-400">--%</p>
          <p className="text-gray-500 mt-2">Error Rate</p>
        </Card>
      </div>

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="text-purple-600" size={24} />
            LangSmith Features
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><strong>Trace Visualization:</strong> See complete LLM call chains</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><strong>Performance Metrics:</strong> Latency, tokens, cost tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><strong>Debug Tools:</strong> Inspect prompts and model responses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><strong>Dataset Management:</strong> Test and evaluate AI behavior</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <span><strong>Production Monitoring:</strong> Real-time AI health checks</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" size={24} />
            Use Cases in Ride App
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span><strong>Customer Support:</strong> Monitor chatbot conversations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span><strong>Driver Support:</strong> Track AI assistant performance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span><strong>Voice Booking:</strong> Analyze speech-to-text accuracy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span><strong>Route Optimization:</strong> ML model predictions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">→</span>
              <span><strong>Fraud Detection:</strong> Anomaly detection monitoring</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Integration Steps */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Integration Steps</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Create LangSmith Account</p>
              <p className="text-gray-600 text-sm mt-1">Sign up at langsmith.com and create a new project</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">Get API Key</p>
              <p className="text-gray-600 text-sm mt-1">Generate an API key from your LangSmith project settings</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">Configure Environment Variables</p>
              <p className="text-gray-600 text-sm mt-1">
                Add <code className="bg-gray-100 px-2 py-1 rounded">LANGSMITH_API_KEY</code> to your backend .env file
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Initialize Tracing</p>
              <p className="text-gray-600 text-sm mt-1">Add LangSmith callbacks to your LangChain/LLM code</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <p className="font-semibold text-gray-900">Connect Dashboard</p>
              <p className="text-gray-600 text-sm mt-1">Click "Connect LangSmith Account" above to link this admin panel</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Documentation Link */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">📚 Documentation</h3>
        <p className="text-gray-700 mb-4">
          Learn more about LangSmith integration and best practices for AI observability
        </p>
        <div className="flex gap-3">
          <Button variant="outline">
            View LangSmith Docs
          </Button>
          <Button variant="outline">
            Integration Guide
          </Button>
        </div>
      </Card>
    </div>
  );
};

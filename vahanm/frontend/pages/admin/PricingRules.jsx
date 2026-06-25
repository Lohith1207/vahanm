import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X
} from 'lucide-react';

export const PricingRules = () => {
  const [editingId, setEditingId] = useState(null);

  // Mock pricing rules
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Base Fare',
      description: 'Minimum charge for any ride',
      value: 50,
      unit: '₹',
      type: 'fixed',
      active: true
    },
    {
      id: 2,
      name: 'Per KM Charge',
      description: 'Charge per kilometer traveled',
      value: 12,
      unit: '₹/km',
      type: 'distance',
      active: true
    },
    {
      id: 3,
      name: 'Per Minute Charge',
      description: 'Charge per minute of ride time',
      value: 2,
      unit: '₹/min',
      type: 'time',
      active: true
    },
    {
      id: 4,
      name: 'Peak Hour Surge',
      description: 'Multiplier during 8-10 AM & 5-8 PM',
      value: 1.5,
      unit: 'x',
      type: 'surge',
      active: true
    },
    {
      id: 5,
      name: 'Night Charge',
      description: 'Multiplier for rides after 11 PM',
      value: 1.3,
      unit: 'x',
      type: 'surge',
      active: true
    },
    {
      id: 6,
      name: 'Cancellation Fee',
      description: 'Fee if customer cancels after 5 min',
      value: 30,
      unit: '₹',
      type: 'penalty',
      active: true
    },
    {
      id: 7,
      name: 'Platform Commission',
      description: 'Default commission for free plan',
      value: 20,
      unit: '%',
      type: 'commission',
      active: true
    },
    {
      id: 8,
      name: 'Minimum Distance',
      description: 'Minimum chargeable distance',
      value: 2,
      unit: 'km',
      type: 'threshold',
      active: true
    }
  ]);

  const getRuleTypeColor = (type) => {
    const colors = {
      fixed: 'bg-blue-100 text-blue-700',
      distance: 'bg-green-100 text-green-700',
      time: 'bg-purple-100 text-purple-700',
      surge: 'bg-orange-100 text-orange-700',
      penalty: 'bg-red-100 text-red-700',
      commission: 'bg-yellow-100 text-yellow-700',
      threshold: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleSave = (id) => {
    setEditingId(null);
    alert(`Pricing rule ${id} updated successfully`);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this pricing rule?')) {
      setRules(rules.filter(rule => rule.id !== id));
    }
  };

  const toggleActive = (id) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, active: !rule.active } : rule
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-green-600" size={32} />
            Pricing Rules Editor
          </h1>
          <p className="text-gray-600 mt-1">Configure fare calculation and commission rates</p>
        </div>
        <Button>
          <Plus size={18} />
          Add Rule
        </Button>
      </div>

      {/* Pricing Formula Preview */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Current Fare Formula</h3>
        <div className="bg-white p-4 rounded-lg font-mono text-sm">
          <p className="text-gray-900">
            <strong>Fare =</strong> Base (₹{rules.find(r => r.name === 'Base Fare')?.value}) + 
            (Distance × ₹{rules.find(r => r.name === 'Per KM Charge')?.value}/km) + 
            (Time × ₹{rules.find(r => r.name === 'Per Minute Charge')?.value}/min) × Surge Multiplier
          </p>
          <p className="text-gray-600 mt-2">
            Example: 10km in 25min during peak hours = ₹{50 + (10 * 12) + (25 * 2)} × 1.5 = ₹{(50 + (10 * 12) + (25 * 2)) * 1.5}
          </p>
        </div>
      </Card>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule) => (
          <Card key={rule.id} className={`p-6 ${!rule.active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{rule.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRuleTypeColor(rule.type)}`}>
                    {rule.type.charAt(0).toUpperCase() + rule.type.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{rule.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rule.active}
                  onChange={() => toggleActive(rule.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {editingId === rule.id ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Input
                    type="number"
                    defaultValue={rule.value}
                    className="flex-1"
                  />
                  <Input
                    defaultValue={rule.unit}
                    className="w-24"
                    disabled
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleSave(rule.id)}
                  >
                    <Save size={16} />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-900">
                    {rule.value} <span className="text-lg text-gray-600">{rule.unit}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(rule.id)}
                  >
                    <Edit size={16} />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Tips Card */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Pricing Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Keep base fare competitive with local market rates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Surge pricing helps balance supply-demand during peak hours</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Test pricing changes with A/B testing before full rollout</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Monitor competitor pricing and adjust accordingly</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

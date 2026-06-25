import { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { 
  Car, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Calendar,
  Info
} from 'lucide-react';

export const VehicleManagement = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock vehicles
  const vehicles = [
    {
      id: 1,
      name: 'Honda City',
      type: 'Sedan',
      number: 'MH 02 AB 1234',
      year: 2021,
      color: 'Silver',
      active: true
    },
    {
      id: 2,
      name: 'Maruti Swift',
      type: 'Hatchback',
      number: 'MH 02 CD 5678',
      year: 2020,
      color: 'White',
      active: false
    }
  ];

  // Mock documents
  const documents = [
    {
      id: 1,
      name: 'Driving License',
      status: 'verified',
      expiryDate: '2027-06-15',
      uploadedOn: '2023-01-10'
    },
    {
      id: 2,
      name: 'Vehicle Registration (RC)',
      status: 'verified',
      expiryDate: '2025-12-30',
      uploadedOn: '2023-01-10'
    },
    {
      id: 3,
      name: 'Vehicle Insurance',
      status: 'expiring',
      expiryDate: '2024-03-15',
      uploadedOn: '2023-03-01'
    },
    {
      id: 4,
      name: 'Pollution Certificate (PUC)',
      status: 'expired',
      expiryDate: '2024-01-20',
      uploadedOn: '2023-07-15'
    },
    {
      id: 5,
      name: 'Commercial Permit',
      status: 'pending',
      expiryDate: null,
      uploadedOn: '2024-02-05'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-700 border-green-300';
      case 'expiring': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'expired': return 'bg-red-100 text-red-700 border-red-300';
      case 'pending': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle size={20} className="text-green-600" />;
      case 'expiring': return <AlertCircle size={20} className="text-yellow-600" />;
      case 'expired': return <AlertCircle size={20} className="text-red-600" />;
      case 'pending': return <Info size={20} className="text-blue-600" />;
      default: return null;
    }
  };

  const activeVehicle = vehicles.find(v => v.id === selectedVehicle);
  const expiredDocs = documents.filter(d => d.status === 'expired' || d.status === 'expiring').length;

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      {expiredDocs > 0 && (
        <Card className="p-4 bg-yellow-50 border-2 border-yellow-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <p className="font-semibold text-gray-900">Action Required</p>
              <p className="text-sm text-gray-700">
                {expiredDocs} document{expiredDocs > 1 ? 's need' : ' needs'} your attention. Update immediately to continue accepting rides.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Vehicle */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Car className="text-blue-600" size={24} />
            Active Vehicle
          </h3>
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
            + Add Vehicle
          </Button>
        </div>

        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Car className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{activeVehicle.name}</h4>
              <p className="text-gray-700 font-semibold text-lg">{activeVehicle.number}</p>
              <p className="text-gray-600 text-sm mt-1">
                {activeVehicle.type} • {activeVehicle.year} • {activeVehicle.color}
              </p>
            </div>
            <span className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold">
              Active
            </span>
          </div>
        </Card>
      </Card>

      {/* All Vehicles */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">My Vehicles</h3>
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              hoverable
              className={`p-4 cursor-pointer ${
                vehicle.id === selectedVehicle
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border border-gray-200'
              }`}
              onClick={() => setSelectedVehicle(vehicle.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    vehicle.id === selectedVehicle ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <Car className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{vehicle.name}</p>
                    <p className="text-sm text-gray-600">{vehicle.number}</p>
                  </div>
                </div>
                {vehicle.active ? (
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                    Active
                  </span>
                ) : (
                  <Button variant="outline" size="sm">
                    Switch
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Documents Status */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="text-blue-600" size={24} />
          Documents Status
        </h3>

        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className={`p-4 border-2 ${getStatusColor(doc.status)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{doc.name}</p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      {doc.expiryDate && (
                        <p className="flex items-center gap-2">
                          <Calendar size={14} />
                          Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.uploadedOn).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={doc.status === 'verified' ? 'outline' : 'primary'}
                    size="sm"
                  >
                    <Upload size={16} />
                    {doc.status === 'verified' ? 'Re-upload' : 'Upload'}
                  </Button>
                  {doc.status === 'verified' && (
                    <span className="text-xs text-green-600 font-semibold text-center">
                      Verified ✓
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> All documents must be valid and verified to continue accepting rides. 
            Upload clear photos/scans for faster verification.
          </p>
        </div>
      </Card>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Vehicle"
        size="md"
      >
        <div className="space-y-4">
          <Input label="Vehicle Name" placeholder="e.g., Honda City" />
          <Input label="Vehicle Number" placeholder="e.g., MH 02 AB 1234" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Year" type="number" placeholder="2021" />
            <Input label="Color" placeholder="Silver" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Sedan</option>
              <option>Hatchback</option>
              <option>SUV</option>
              <option>Mini</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1">
              Add Vehicle
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

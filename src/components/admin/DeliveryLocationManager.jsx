import React, { useState, useEffect } from 'react';
import { useUser } from '../../assets/context-api/user-context/UseUser';
import { X } from 'lucide-react';
import {
  fetchAllDeliveryLocations,
  createDeliveryLocation,
  updateDeliveryLocation,
  deleteDeliveryLocation,
  bulkUpdateDeliveryLocationStatus,
} from '../../services/deliveryLocationApi';

const DeliveryLocationManager = () => {
  const { token } = useUser();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shippingAmount: '',
    isActive: true,
    sortOrder: 0,
  });

  // Fetch all locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAllDeliveryLocations(token);
      setLocations(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'shippingAmount' ? (value === '' ? '' : parseFloat(value)) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || formData.shippingAmount === '') {
      setError('Name and shipping amount are required');
      return;
    }

    if (formData.shippingAmount < 0) {
      setError('Shipping amount cannot be negative');
      return;
    }

    try {
      if (editingId) {
        await updateDeliveryLocation(editingId, formData, token);
        setSuccess('Delivery location updated successfully');
      } else {
        await createDeliveryLocation(formData, token);
        setSuccess('Delivery location created successfully');
      }
      resetForm();
      loadLocations();
    } catch (err) {
      setError(err.message);
      console.error('Error saving location:', err);
    }
  };

  const handleEdit = (location) => {
    setFormData({
      name: location.name,
      description: location.description || '',
      shippingAmount: location.shippingAmount,
      isActive: location.isActive,
      sortOrder: location.sortOrder || 0,
    });
    setEditingId(location._id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      setError('');
      await deleteDeliveryLocation(id, token);
      setSuccess('Delivery location deleted successfully');
      loadLocations();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting location:', err);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      setError('');
      await bulkUpdateDeliveryLocationStatus([id], !currentStatus, token);
      setSuccess('Delivery location status updated successfully');
      loadLocations();
    } catch (err) {
      setError(err.message);
      console.error('Error updating status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shippingAmount: '',
      isActive: true,
      sortOrder: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-[22px] md:text-[26px] font-bold text-gray-800 mb-6">Delivery Location Manager</h1>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Add/Edit Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? 'Edit Delivery Location' : 'Add New Delivery Location'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Lekki, Victoria Island"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Amount (₦)*</label>
                <input
                  type="number"
                  name="shippingAmount"
                  value={formData.shippingAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 2000"
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Lekki Phase 1, Lekki Phase 2, etc."
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {editingId ? 'Update' : 'Create'} Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          Add New Location
        </button>
      )}

      {/* Locations Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Location Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Shipping Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sort Order</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <span className="inline-block animate-spin text-blue-600" />
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No delivery locations found
                  </td>
                </tr>
              ) : (
                locations.map(location => (
                  <tr key={location._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{location.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{location.description || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₦{location.shippingAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{location.sortOrder}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(location._id, location.isActive)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition ${
                          location.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {location.isActive ? (
                          <>
                            Active
                          </>
                        ) : (
                          <>
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition flex items-center gap-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(location._id, location.name)}
                          disabled={deleting === location._id}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {deleting === location._id ? (
                            <span className="animate-spin" />
                          ) : (
                            <span />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {!loading && locations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>{locations.filter(l => l.isActive).length}</strong> active locations | 
            <strong className="ml-2">{locations.filter(l => !l.isActive).length}</strong> inactive locations
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryLocationManager;

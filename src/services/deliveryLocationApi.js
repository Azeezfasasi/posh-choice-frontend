import { API_BASE_URL } from '../config/api';

// Fetch all active delivery locations
export const fetchDeliveryLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-locations`);
    if (!response.ok) {
      throw new Error('Failed to fetch delivery locations');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching delivery locations:', error);
    throw error;
  }
};

// Fetch all delivery locations (including inactive) - Admin
export const fetchAllDeliveryLocations = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-locations?includeInactive=true`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch delivery locations');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching delivery locations:', error);
    throw error;
  }
};

// Create delivery location - Admin
export const createDeliveryLocation = async (locationData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(locationData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create delivery location');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating delivery location:', error);
    throw error;
  }
};

// Update delivery location - Admin
export const updateDeliveryLocation = async (id, locationData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(locationData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update delivery location');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating delivery location:', error);
    throw error;
  }
};

// Delete delivery location - Admin
export const deleteDeliveryLocation = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-locations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete delivery location');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting delivery location:', error);
    throw error;
  }
};

// Bulk update delivery locations status - Admin
export const bulkUpdateDeliveryLocationStatus = async (locationIds, isActive, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-locations/bulk/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ locationIds, isActive }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update delivery locations');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating delivery locations:', error);
    throw error;
  }
};

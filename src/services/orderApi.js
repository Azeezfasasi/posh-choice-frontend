import { API_BASE_URL } from '../config/api';

// Create a new order
export const createOrder = async (orderData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get user's orders
export const getMyOrders = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch order');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Get all orders - Admin
export const getAllOrders = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Update order status - Admin
export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update order status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update payment status - Admin
export const updateOrderPaymentStatus = async (orderId, status, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update payment status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Upload Bank Transfer payment proof
export const uploadPaymentProof = async (orderId, file, token) => {
  try {
    const formData = new FormData();
    formData.append('proof', file);

    const headers = {};
    
    // Add authorization header only if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/upload-payment-proof`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload payment proof');
    }
    return await response.json();
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    throw error;
  }
};

// Get public order status
export const getPublicOrderStatus = async (orderNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/public-status/${orderNumber}`, {
      method: 'GET',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch order status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching public order status:', error);
    throw error;
  }
};

// Delete order - Admin
export const deleteOrder = async (orderId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete order');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

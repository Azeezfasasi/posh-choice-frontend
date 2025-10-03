import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

function NewsletterSubscriberMain() {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [viewSubscriber, setViewSubscriber] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch all subscribers
  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/newsletter/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // Remove subscriber
  const removeMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_BASE_URL}/newsletter/subscribers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      setSuccess('Subscriber removed.');
      setError('');
      queryClient.invalidateQueries(['subscribers']);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to remove subscriber.');
      setSuccess('');
    },
  });

  // Edit subscriber
  const editMutation = useMutation({
    mutationFn: async ({ id, name, tags, notes }) => {
      const res = await axios.put(
        `${API_BASE_URL}/newsletter/subscribers/${id}`,
        { name, tags, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      setSuccess('Subscriber updated.');
      setError('');
      setEditId(null);
      queryClient.invalidateQueries(['subscribers']);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to update subscriber.');
      setSuccess('');
    },
  });

  const handleEdit = (subscriber) => {
    setEditId(subscriber._id);
    setEditName(subscriber.name || '');
    setEditTags(subscriber.tags ? subscriber.tags.join(', ') : '');
    setEditNotes(subscriber.notes || '');
    setSuccess('');
    setError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editMutation.mutate({
      id: editId,
      name: editName,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      notes: editNotes,
    });
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: 40 }} className='text-purple-500'>Loading subscribers...</div>;
  if (isError) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Failed to load subscribers.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #e0e0e0', padding: 32 }}>
      <h2 style={{ marginBottom: 24 }} className='text-purple-500 font-bold'>Newsletter Subscribers</h2>
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#f5faff' }}>
              <th style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>Email</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>Name</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>Status</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>Subscribed At</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>Tags</th>
              <th style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>No subscribers found.</td></tr>
            )}
            {data && data.map(subscriber => (
              <tr key={subscriber._id} style={{ background: editId === subscriber._id ? '#f0f8ff' : '#fff' }}>
                <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0', fontWeight: 500 }}>{subscriber.email}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>{subscriber.name || '-'}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>{subscriber.isActive ? 'Active' : 'Unsubscribed'}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>{subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleDateString() : '-'}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0', maxWidth: 120, wordBreak: 'break-all' }}>{subscriber.tags?.join(', ') || '-'}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #e0e0e0' }}>
                  {editId === subscriber._id ? (
                    <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={editTags}
                        onChange={e => setEditTags(e.target.value)}
                        style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                        placeholder="Tags (comma separated)"
                      />
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', minHeight: 40 }}
                        placeholder="Notes"
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" style={{ background: '#00B9F1', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600 }}>Save</button>
                        <button type="button" style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 18px' }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <button
                        style={{ background: '#00B9F1', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, marginRight: 8 }}
                        onClick={() => handleEdit(subscriber)}
                      >Edit</button>
                      <button
                        style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, marginRight: 8 }}
                        onClick={() => removeMutation.mutate(subscriber._id)}
                        disabled={removeMutation.isLoading}
                      >Remove</button>
                      <button
                        style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600 }}
                        onClick={() => setViewSubscriber(subscriber)}
                      >View</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* View subscriber details modal */}
      {viewSubscriber && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 340, maxWidth: 400, boxShadow: '0 2px 12px #e0e0e0', position: 'relative' }}>
            <button onClick={() => setViewSubscriber(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ color: '#00B9F1', marginBottom: 16 }}>Subscriber Details</h3>
            <div style={{ marginBottom: 8 }}><b>Email:</b> {viewSubscriber.email}</div>
            <div style={{ marginBottom: 8 }}><b>Name:</b> {viewSubscriber.name || '-'}</div>
            <div style={{ marginBottom: 8 }}><b>Status:</b> {viewSubscriber.isActive ? 'Active' : 'Unsubscribed'}</div>
            <div style={{ marginBottom: 8 }}><b>Subscribed At:</b> {viewSubscriber.subscribedAt ? new Date(viewSubscriber.subscribedAt).toLocaleString() : '-'}</div>
            <div style={{ marginBottom: 8 }}><b>Unsubscribed At:</b> {viewSubscriber.unsubscribedAt ? new Date(viewSubscriber.unsubscribedAt).toLocaleString() : '-'}</div>
            <div style={{ marginBottom: 8 }}><b>Tags:</b> {viewSubscriber.tags?.join(', ') || '-'}</div>
            <div style={{ marginBottom: 8 }}><b>Notes:</b> {viewSubscriber.notes || '-'}</div>
            <div style={{ marginBottom: 8 }}><b>Last Newsletter Sent:</b> {viewSubscriber.lastNewsletterSentAt ? new Date(viewSubscriber.lastNewsletterSentAt).toLocaleString() : '-'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewsletterSubscriberMain;
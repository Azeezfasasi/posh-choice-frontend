import React, { useState } from 'react';
import RichTextEditor from '../RichTextEditor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';

function AllNewsletterMain() {
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editContent, setEditContent] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  // Fetch all newsletters
  const { data, isLoading, isError } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/newsletter/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });

  // Delete newsletter
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_BASE_URL}/newsletter/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      setSuccess('Newsletter deleted.');
      setError('');
      queryClient.invalidateQueries(['newsletters']);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to delete newsletter.');
      setSuccess('');
    },
  });

  // Edit newsletter (only if draft)
  const editMutation = useMutation({
    mutationFn: async ({ id, subject, content }) => {
      const res = await axios.put(
        `${API_BASE_URL}/${id}`,
        { subject, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      setSuccess('Newsletter updated.');
      setError('');
      setEditId(null);
      queryClient.invalidateQueries(['newsletters']);
    },
    onError: (err) => {
      setError(err.response?.data?.error || 'Failed to update newsletter.');
      setSuccess('');
    },
  });

  const handleEdit = (newsletter) => {
    setEditId(newsletter._id);
    setEditSubject(newsletter.subject);
    setEditContent(newsletter.content);
    setSuccess('');
    setError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editSubject || !editContent) {
      setError('Subject and content are required.');
      return;
    }
    editMutation.mutate({ id: editId, subject: editSubject, content: editContent });
  };

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading newsletters...</div>;
  if (isError) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Failed to load newsletters.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #ece7e1', padding: 32 }}>
      <h2 style={{ marginBottom: 24 }} className='text-plum-700 font-bold'>All Newsletters</h2>
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#faf8f5' }}>
              <th style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>Subject</th>
              <th style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>Status</th>
              <th style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>Sent At</th>
              <th style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>Recipients</th>
              <th style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>No newsletters found.</td></tr>
            )}
            {data && data.map(newsletter => (
              <tr key={newsletter._id} style={{ background: editId === newsletter._id ? '#f6f1fa' : '#fff' }}>
                <td style={{ padding: 12, borderBottom: '1px solid #ece7e1', fontWeight: 500 }}>{newsletter.subject}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>{newsletter.status}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>{newsletter.sentAt ? new Date(newsletter.sentAt).toLocaleString() : '-'}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #ece7e1', maxWidth: 180, wordBreak: 'break-all' }}>{newsletter.recipients?.length || 0}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #ece7e1' }}>
                  {editId === newsletter._id ? (
                    <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="text"
                        value={editSubject}
                        onChange={e => setEditSubject(e.target.value)}
                        style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                        required
                      />
                      <div style={{ minWidth: 420 }}>
                        <RichTextEditor value={editContent} onChange={setEditContent} minHeight={200} placeholder="Newsletter content" />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="submit" style={{ background: '#5b2a86', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600 }}>Save</button>
                        <button type="button" style={{ background: '#ece7e1', color: '#0f1b3d', border: 'none', borderRadius: 4, padding: '6px 18px' }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {newsletter.status === 'draft' && (
                        <button
                          style={{ background: '#5b2a86', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600, marginRight: 8 }}
                          onClick={() => handleEdit(newsletter)}
                        >Edit</button>
                      )}
                      <button
                        style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', fontWeight: 600 }}
                        onClick={() => deleteMutation.mutate(newsletter._id)}
                        disabled={deleteMutation.isPending}
                      >Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllNewsletterMain;
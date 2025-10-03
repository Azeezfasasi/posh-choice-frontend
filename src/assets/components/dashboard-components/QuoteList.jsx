import React, { useState, useEffect } from 'react';
import { useQuote } from '../../context-api/Request-quote-context/UseQuote';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaEye, FaFilter, FaSearch, FaSave, FaTimesCircle, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const statusOptions = [
  { value: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'In Review', color: 'bg-blue-100 text-blue-800' },
  { value: 'Done', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'Rejected', color: 'bg-red-100 text-red-800' }
];

const PAGE_SIZE = 10;

const QuoteList = () => {
  const { quotes, deleteQuote, updateQuote, loading, error, success } = useQuote();
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [page, setPage] = useState(1);
  const [viewQuote, setViewQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [success2, setSuccess2] = useState('');

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success2) {
      const timer = setTimeout(() => {
        setSuccess2('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success2]);

  const handleEdit = (quote) => {
    setEditId(quote._id);
    setEditData({ ...quote });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await updateQuote(editId, editData);
      setSuccess2('Quote updated successfully');
      setEditId(null);
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateQuote(id, { status });
      setSuccess2(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteClick = (quote) => {
    setQuoteToDelete(quote);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteQuote(quoteToDelete._id);
      setSuccess2('Quote deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtering and sorting
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? quote.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalQuotes = sortedQuotes.length;
  const totalPages = Math.ceil(totalQuotes / PAGE_SIZE);
  const paginatedQuotes = sortedQuotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // Helper to get status badge color
  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(opt => opt.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quote Requests</h2>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Total: {totalQuotes}
        </div>
      </div>

      {/* Success & Error Messages */}
      {(error || success || success2) && (
        <div className={`mb-4 p-3 rounded-md ${
          error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        } flex items-center justify-between`}>
          <div className="flex items-center">
            {error ? <FaTimes className="mr-2" /> : <FaCheck className="mr-2" />}
            <span>{error || success || success2}</span>
          </div>
          <button 
            onClick={() => error ? null : setSuccess2('')} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimesCircle />
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search quotes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.value}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 flex items-center">
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading quotes...
            </div>
          ) : (
            <span>
              Showing {paginatedQuotes.length} of {totalQuotes} quotes
            </span>
          )}
        </div>
      </div>

      {/* Quotes Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center">
                  Email
                  {sortConfig.key === 'email' && (
                    sortConfig.direction === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('phone')}
              >
                <div className="flex items-center">
                  Phone Number
                  {sortConfig.key === 'phone' && (
                    sortConfig.direction === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('service')}
              >
                <div className="flex items-center">
                  Service
                  {sortConfig.key === 'service' && (
                    sortConfig.direction === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {sortConfig.key === 'status' && (
                    sortConfig.direction === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedQuotes.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No quote requests found.
                </td>
              </tr>
            ) : (
              paginatedQuotes.map((quote) => (
                <tr key={quote._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editId === quote._id ? (
                      <input
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="border rounded px-3 py-1 w-full"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{quote.name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editId === quote._id ? (
                      <input
                        name="email"
                        value={editData.email}
                        onChange={handleEditChange}
                        className="border rounded px-3 py-1 w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">{quote.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editId === quote.phone ? (
                      <input
                        name="phone"
                        value={editData.phone}
                        onChange={handleEditChange}
                        className="border rounded px-3 py-1 w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">{quote.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editId === quote._id ? (
                      <input
                        name="service"
                        value={editData.service}
                        onChange={handleEditChange}
                        className="border rounded px-3 py-1 w-full"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{quote.service}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editId === quote._id ? (
                      <textarea
                        name="message"
                        value={editData.message}
                        onChange={handleEditChange}
                        className="border rounded px-3 py-1 w-full"
                        rows="2"
                      />
                    ) : (
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {quote.message.length > 50 
                          ? `${quote.message.substring(0, 50)}...` 
                          : quote.message
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editId === quote._id ? (
                      <select
                        name="status"
                        value={editData.status}
                        onChange={handleEditChange}
                        className="border rounded px-3 py-1 w-full"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>{status.value}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                        className={`${getStatusColor(quote.status)} border-0 rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                      >
                        {statusOptions.map((status) => (
                          <option 
                            key={status.value} 
                            value={status.value}
                            className="bg-white text-gray-800"
                          >
                            {status.value}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      {editId === quote._id ? (
                        <>
                          <button
                            onClick={handleEditSave}
                            className="text-green-600 hover:text-green-900 focus:outline-none cursor-pointer"
                            title="Save"
                          >
                            <FaSave size={18} />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
                            title="Cancel"
                          >
                            <FaTimesCircle size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setViewQuote(quote)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none cursor-pointer"
                            title="View Details"
                          >
                            <FaEye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(quote)}
                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none cursor-pointer"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(quote)}
                            className="text-red-600 hover:text-red-900 focus:outline-none cursor-pointer"
                            title="Delete"
                          >
                            <FaTrash size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * PAGE_SIZE, totalQuotes)}
            </span>{' '}
            of <span className="font-medium">{totalQuotes}</span> results
          </div>
          <nav className="flex space-x-1">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* View Quote Modal */}
      {viewQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Quote Details</h3>
              <button 
                onClick={() => setViewQuote(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{viewQuote.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{viewQuote.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-medium">{viewQuote.service}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewQuote.status)}`}>
                    {viewQuote.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p className="font-medium">{new Date(viewQuote.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Message</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-line">{viewQuote.message}</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3 border-t">
                <button
                  onClick={() => {
                    handleEdit(viewQuote);
                    setViewQuote(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => setViewQuote(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <FaTrash className="mx-auto text-red-500 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Quote Request</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete the quote request from <span className="font-medium">{quoteToDelete.name}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteList;
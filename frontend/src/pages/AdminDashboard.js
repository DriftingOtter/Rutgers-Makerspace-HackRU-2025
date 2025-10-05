import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOutAdmin } from '../firebase/auth';
import ModelViewer from '../components/ModelViewer';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [printRequests, setPrintRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [requestDetails, setRequestDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john.doe@rutgers.edu', role: 'Student', joinDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@rutgers.edu', role: 'Faculty', joinDate: '2024-01-10', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@rutgers.edu', role: 'Student', joinDate: '2024-01-20', status: 'Inactive' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@rutgers.edu', role: 'Staff', joinDate: '2024-01-05', status: 'Active' }
  ];

  const mockPrintRequests = [
    { 
      id: 1, 
      user: 'John Doe', 
      email: 'john.doe@rutgers.edu',
      title: 'Phone Case', 
      description: 'Custom phone case for iPhone 15 with Rutgers logo',
      status: 'Completed', 
      date: '2024-01-25', 
      cost: 12.50,
      material: 'PLA',
      color: 'Red',
      printer: 'Prusa i3 MK3S+',
      printTime: '2.5 hours',
      fileSize: '2.3 MB',
      notes: 'High quality print, customer satisfied',
      isPublic: true,
      modelUrl: '/models/resonator-iem-shell.stl',
      fallbackImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    },
    { 
      id: 2, 
      user: 'Jane Smith', 
      email: 'jane.smith@rutgers.edu',
      title: 'Prototype Housing', 
      description: 'Protective housing for electronics project',
      status: 'In Progress', 
      date: '2024-01-24', 
      cost: 18.75,
      material: 'PETG',
      color: 'Black',
      printer: 'Ultimaker S5',
      printTime: '4.2 hours',
      fileSize: '5.1 MB',
      notes: 'Currently printing, 60% complete',
      isPublic: false,
      modelUrl: null,
      fallbackImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop'
    },
    { 
      id: 3, 
      user: 'Mike Johnson', 
      email: 'mike.johnson@rutgers.edu',
      title: 'Arduino Mount', 
      description: 'Mounting bracket for Arduino project',
      status: 'Pending', 
      date: '2024-01-23', 
      cost: 8.25,
      material: 'PLA',
      color: 'White',
      printer: 'Prusa i3 MK3S+',
      printTime: '1.8 hours',
      fileSize: '1.2 MB',
      notes: 'Waiting for material restock',
      isPublic: true,
      modelUrl: null,
      fallbackImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop'
    },
    { 
      id: 4, 
      user: 'Sarah Wilson', 
      email: 'sarah.wilson@rutgers.edu',
      title: 'Custom Bracket', 
      description: 'Custom bracket for lab equipment',
      status: 'Completed', 
      date: '2024-01-22', 
      cost: 15.00,
      material: 'ABS',
      color: 'Carbon Fiber Reinforced',
      printer: 'Formlabs Form 3',
      printTime: '3.1 hours',
      fileSize: '3.4 MB',
      notes: 'Excellent quality, ready for pickup',
      isPublic: false,
      modelUrl: null,
      fallbackImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop'
    }
  ];

  const mockEquipment = [
    { id: 1, name: 'Prusa i3 MK3S+', type: '3D Printer', status: 'Operational', lastMaintenance: '2024-01-20' },
    { id: 2, name: 'Ultimaker S5', type: '3D Printer', status: 'Maintenance', lastMaintenance: '2024-01-18' },
    { id: 3, name: 'Formlabs Form 3', type: 'Resin Printer', status: 'Operational', lastMaintenance: '2024-01-15' },
    { id: 4, name: 'CNC Mill', type: 'CNC Machine', status: 'Operational', lastMaintenance: '2024-01-10' }
  ];

  const loadAdminData = useCallback(async () => {
    // Don't reload if data is already loaded
    if (dataLoaded) {
      return;
    }

    setLoading(true);
    try {
      // In a real app, these would be API calls
      setUsers(mockUsers);
      setPrintRequests(mockPrintRequests);
      setEquipment(mockEquipment);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [mockUsers, mockPrintRequests, mockEquipment, dataLoaded]);

  // Fetch detailed print request data from database
  const fetchRequestDetails = async (requestId) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:8080/api/print-request/${requestId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setRequestDetails(data.data);
      } else {
        console.error('Failed to fetch request details:', data.message);
        // Fallback to mock data if database fails
        const mockRequest = mockPrintRequests.find(req => req.id === requestId);
        if (mockRequest) {
          setRequestDetails(mockRequest);
        }
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      // Fallback to mock data
      const mockRequest = mockPrintRequests.find(req => req.id === requestId);
      if (mockRequest) {
        setRequestDetails(mockRequest);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle view details button click
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    fetchRequestDetails(request.id);
  };

  const updateRequestStatus = async (requestId, newStatus, notes = '') => {
    try {
      // Update the request in the local state
      setPrintRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, notes: notes || req.notes }
            : req
        )
      );
      
      // Here you would typically make an API call to update the database
      console.log(`Updated request ${requestId} to status: ${newStatus}`);
      
      // Close the edit modal
      setEditingRequest(null);
      setEditStatus('');
      setEditNotes('');
      
      // Show success message (you could add a toast notification here)
      alert(`Request status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Failed to update request status');
    }
  };

  const startEditingRequest = (request) => {
    setEditingRequest(request);
    setEditStatus(request.status);
    setEditNotes(request.notes || '');
  };

  useEffect(() => {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }

    // Load admin data only once
    if (!dataLoaded) {
      loadAdminData();
    }
  }, [user, navigate, loadAdminData, dataLoaded]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Completed':
      case 'Operational':
        return 'status-success';
      case 'In Progress':
        return 'status-warning';
      case 'Pending':
        return 'status-info';
      case 'Inactive':
      case 'Maintenance':
        return 'status-danger';
      default:
        return 'status-default';
    }
  };

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="overview-header">
        <h2>Admin Dashboard Overview</h2>
        <p>Welcome to the RUmakerspace Admin Panel</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
            <span className="stat-change">+2 this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🖨️</div>
          <div className="stat-content">
            <h3>{printRequests.length}</h3>
            <p>Print Requests</p>
            <span className="stat-change">+5 this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚙️</div>
          <div className="stat-content">
            <h3>{equipment.length}</h3>
            <p>Equipment Items</p>
            <span className="stat-change">All operational</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${printRequests.reduce((sum, req) => sum + (req.cost || 0), 0).toFixed(2)}</h3>
            <p>Total Revenue</p>
            <span className="stat-change">+12% this month</span>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {printRequests.slice(0, 5).map(request => (
            <div key={request.id} className="activity-item">
              <div className="activity-icon">🖨️</div>
              <div className="activity-content">
                <p><strong>{request.user}</strong> submitted "{request.title}"</p>
                <span className="activity-time">{request.date}</span>
              </div>
              <div className={`activity-status ${getStatusColor(request.status)}`}>
                {request.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-users">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="btn btn-primary">Add New User</button>
      </div>

      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.joinDate}</td>
                <td>
                  <span className={`status ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPrintRequests = () => (
    <div className="admin-requests">
      <div className="section-header">
        <h2>Print Request Management</h2>
        <div className="filter-controls">
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="requests-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {printRequests.map(request => (
              <tr key={request.id}>
                <td>#{request.id}</td>
                <td>{request.user}</td>
                <td>{request.title}</td>
                <td>
                  <span className={`status ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td>{request.date}</td>
                <td>${request.cost}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewDetails(request)}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => startEditingRequest(request)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEquipment = () => (
    <div className="admin-equipment">
      <div className="section-header">
        <h2>Equipment Management</h2>
        <button className="btn btn-primary">Add Equipment</button>
      </div>

      <div className="equipment-grid">
        {equipment.map(item => (
          <div key={item.id} className="equipment-card">
            <div className="equipment-header">
              <h3>{item.name}</h3>
              <span className={`status ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <div className="equipment-details">
              <p><strong>Type:</strong> {item.type}</p>
              <p><strong>Last Maintenance:</strong> {item.lastMaintenance}</p>
            </div>
            <div className="equipment-actions">
              <button className="btn btn-sm btn-outline">Schedule Maintenance</button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setSelectedEquipment(item)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Print Request Detail Modal
  const renderPrintRequestModal = () => {
    if (!selectedRequest) return null;

    const displayData = requestDetails || selectedRequest;

    return (
      <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Print Request Details</h2>
            <button 
              className="close-btn"
              onClick={() => {
                setSelectedRequest(null);
                setRequestDetails(null);
              }}
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            {loadingDetails ? (
              <div className="loading">Loading request details...</div>
            ) : (
              <>
                {/* 3D Model Viewer */}
                <div className="model-viewer-section">
                  <h3>3D Model Preview</h3>
                  <ModelViewer 
                    modelUrl={displayData.file?.modelUrl || displayData.modelUrl}
                    fallbackImage={displayData.file?.fallbackImage || displayData.fallbackImage}
                    width="100%"
                    height="300px"
                    showControls={true}
                    autoRotate={true}
                  />
                </div>

                <div className="request-details">
                  <div className="detail-row">
                    <strong>Request ID:</strong> #{displayData.id || displayData.requestId}
                  </div>
                  <div className="detail-row">
                    <strong>User:</strong> {displayData.user?.name || displayData.user} ({displayData.user?.email || displayData.email})
              </div>
                  <div className="detail-row">
                    <strong>Title:</strong> {displayData.project?.name || displayData.title}
                  </div>
                  <div className="detail-row">
                    <strong>Description:</strong> {displayData.project?.description || displayData.description}
                  </div>
                  <div className="detail-row">
                    <strong>Status:</strong> 
                    <span className={`status ${getStatusColor(displayData.status)}`}>
                      {displayData.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Date:</strong> {displayData.createdAt || displayData.date}
                  </div>
                  <div className="detail-row">
                    <strong>Cost:</strong> ${displayData.cost || displayData.estimatedCost}
                  </div>
                  <div className="detail-row">
                    <strong>Material:</strong> {displayData.project?.material || displayData.material}
                  </div>
                  <div className="detail-row">
                    <strong>Color:</strong> {displayData.project?.color || displayData.color}
                  </div>
                  <div className="detail-row">
                    <strong>Printer:</strong> {displayData.printer?.id || displayData.printer}
                  </div>
                  <div className="detail-row">
                    <strong>Print Time:</strong> {displayData.printTime || 'N/A'}
                  </div>
                  <div className="detail-row">
                    <strong>File Size:</strong> {displayData.file?.size || displayData.fileSize || 'N/A'}
                  </div>
                  <div className="detail-row">
                    <strong>Public:</strong> 
                    <span className={`status ${displayData.isPublic ? 'status-success' : 'status-danger'}`}>
                      {displayData.isPublic ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Notes:</strong> {displayData.project?.specialInstructions || displayData.notes || 'None'}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary">Update Status</button>
            <button className="btn btn-outline">Edit Request</button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Equipment Detail Modal
  const renderEquipmentModal = () => {
    if (!selectedEquipment) return null;

    return (
      <div className="modal-overlay" onClick={() => setSelectedEquipment(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Equipment Details</h2>
            <button 
              className="close-btn"
              onClick={() => setSelectedEquipment(null)}
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="equipment-details">
              <div className="detail-row">
                <strong>Name:</strong> {selectedEquipment.name}
              </div>
              <div className="detail-row">
                <strong>Type:</strong> {selectedEquipment.type}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> 
                <span className={`status ${getStatusColor(selectedEquipment.status)}`}>
                  {selectedEquipment.status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Last Maintenance:</strong> {selectedEquipment.lastMaintenance}
              </div>
              <div className="detail-row">
                <strong>Next Maintenance:</strong> {selectedEquipment.nextMaintenance || 'Not scheduled'}
              </div>
              <div className="detail-row">
                <strong>Usage Hours:</strong> {selectedEquipment.usageHours || 'N/A'}
              </div>
              <div className="detail-row">
                <strong>Location:</strong> {selectedEquipment.location || 'Main Lab'}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary">Schedule Maintenance</button>
            <button className="btn btn-outline">Edit Equipment</button>
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedEquipment(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Edit Request Modal
  const renderEditRequestModal = () => {
    if (!editingRequest) return null;

    return (
      <div className="modal-overlay" onClick={() => setEditingRequest(null)}>
        <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Edit Request Status</h3>
            <button 
              className="close-btn"
              onClick={() => setEditingRequest(null)}
            >
              ×
            </button>
          </div>
          
          <div className="modal-body">
            <div className="edit-form">
              <div className="form-group">
                <label>Request: {editingRequest.title}</label>
                <p className="request-info">User: {editingRequest.user} | ID: #{editingRequest.id}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <select 
                  id="status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Admin Notes:</label>
                <textarea 
                  id="notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="form-textarea"
                  rows="4"
                  placeholder="Add notes about this request..."
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn btn-outline"
              onClick={() => setEditingRequest(null)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => updateRequestStatus(editingRequest.id, editStatus, editNotes)}
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="loading-container">
          <div className="loading">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <main className="main-content">
        <div className="container">
          <div className="admin-container">
            <div className="admin-sidebar">
              <div className="admin-header">
                <div className="admin-avatar">👑</div>
                <div className="admin-info">
                  <h3>Admin Panel</h3>
                  <p>RUmakerspace</p>
                </div>
              </div>
              
              <nav className="admin-nav">
                <button 
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  📊 Overview
                </button>
                <button 
                  className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  👥 Users
                </button>
                <button 
                  className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  🖨️ Print Requests
                </button>
                <button 
                  className={`nav-item ${activeTab === 'equipment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('equipment')}
                >
                  ⚙️ Equipment
                </button>
                <button 
                  className="nav-item logout-btn"
                  onClick={async () => {
                    await signOutAdmin();
                    setUser(null);
                    navigate('/');
                  }}
                >
                  🚪 Logout
                </button>
              </nav>
            </div>

            <div className="admin-main">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'requests' && renderPrintRequests()}
              {activeTab === 'equipment' && renderEquipment()}
            </div>
          </div>
        </div>
      </main>
      
      {/* Modals */}
      {renderPrintRequestModal()}
      {renderEquipmentModal()}
      {renderEditRequestModal()}
    </div>
  );
};

export default AdminDashboard;

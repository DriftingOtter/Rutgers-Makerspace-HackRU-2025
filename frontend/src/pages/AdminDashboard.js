import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOutAdmin } from '../firebase/auth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [printRequests, setPrintRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
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
    { id: 1, user: 'John Doe', title: 'Phone Case', status: 'Completed', date: '2024-01-25', cost: 12.50 },
    { id: 2, user: 'Jane Smith', title: 'Prototype Housing', status: 'In Progress', date: '2024-01-24', cost: 18.75 },
    { id: 3, user: 'Mike Johnson', title: 'Arduino Mount', status: 'Pending', date: '2024-01-23', cost: 8.25 },
    { id: 4, user: 'Sarah Wilson', title: 'Custom Bracket', status: 'Completed', date: '2024-01-22', cost: 15.00 }
  ];

  const mockEquipment = [
    { id: 1, name: 'Prusa i3 MK3S+', type: '3D Printer', status: 'Operational', lastMaintenance: '2024-01-20' },
    { id: 2, name: 'Ultimaker S5', type: '3D Printer', status: 'Maintenance', lastMaintenance: '2024-01-18' },
    { id: 3, name: 'Formlabs Form 3', type: 'Resin Printer', status: 'Operational', lastMaintenance: '2024-01-15' },
    { id: 4, name: 'CNC Mill', type: 'CNC Machine', status: 'Operational', lastMaintenance: '2024-01-10' }
  ];

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls
      setUsers(mockUsers);
      setPrintRequests(mockPrintRequests);
      setEquipment(mockEquipment);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }

    // Load admin data
    loadAdminData();
  }, [user, navigate, loadAdminData]);

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
                  <button className="btn btn-sm btn-primary">View</button>
                  <button className="btn btn-sm btn-outline">Edit</button>
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
              <button className="btn btn-sm btn-primary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
    </div>
  );
};

export default AdminDashboard;

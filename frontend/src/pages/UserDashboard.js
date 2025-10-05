import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ModelViewer from '../components/ModelViewer';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [printRequests, setPrintRequests] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data for demonstration
  const mockPrintRequests = [
    {
      id: 1,
      title: "Custom Phone Case",
      description: "3D printed phone case for iPhone 15",
      status: "Completed",
      date: "2024-01-15",
      material: "PLA",
      color: "Red",
      cost: 12.50,
      isPublic: true,
      modelUrl: null,
      fallbackImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Arduino Mount",
      description: "Mounting bracket for Arduino project",
      status: "In Progress",
      date: "2024-01-20",
      material: "PETG",
      color: "Black",
      cost: 8.75,
      isPublic: false,
      modelUrl: null,
      fallbackImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Prototype Housing",
      description: "Protective housing for electronics project",
      status: "Pending",
      date: "2024-01-25",
      material: "ABS",
      color: "White",
      cost: 15.00,
      isPublic: true,
      modelUrl: null,
      fallbackImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop"
    }
  ];

  const mockCommunityRequests = [
    {
      id: 1,
      title: "Open Source Drone Frame",
      description: "Lightweight drone frame design for educational purposes",
      author: "MakerSpace Community",
      date: "2024-01-22",
      likes: 15,
      downloads: 8,
      material: "PLA",
      color: "Black",
      modelUrl: null,
      fallbackImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Accessible Door Handle",
      description: "3D printed door handle for accessibility",
      author: "Accessibility Team",
      date: "2024-01-21",
      likes: 23,
      downloads: 12,
      material: "PETG",
      color: "White",
      modelUrl: null,
      fallbackImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Lab Equipment Holder",
      description: "Custom holder for laboratory equipment",
      author: "Science Department",
      date: "2024-01-20",
      likes: 18,
      downloads: 6,
      material: "ABS",
      color: "Grey",
      modelUrl: null,
      fallbackImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop"
    }
  ];

  const loadUserPrintRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Try to connect to Snowflake database
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/print-requests`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.accessToken || 'demo-token'}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrintRequests(data.printRequests || []);
      } else {
        // If Snowflake is not set up, show mock data with error message
        setPrintRequests(mockPrintRequests);
        setError('Database connection not available. Showing sample data. Please contact admin to set up Snowflake database.');
      }
    } catch (err) {
      // Fallback to mock data
      setPrintRequests(mockPrintRequests);
      setError('Database connection not available. Showing sample data. Please contact admin to set up Snowflake database.');
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  const loadCommunityRequests = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/community/print-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommunityRequests(data.requests || []);
      } else {
        // Fallback to mock data
        setCommunityRequests(mockCommunityRequests);
      }
    } catch (err) {
      // Fallback to mock data
      setCommunityRequests(mockCommunityRequests);
    }
  }, []);

  const togglePublicStatus = async (requestId, isPublic) => {
    try {
      // In a real app, this would be an API call
      setPrintRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, isPublic: !isPublic }
            : req
        )
      );
      
      // Update community requests if making public
      if (!isPublic) {
        const request = printRequests.find(req => req.id === requestId);
        if (request) {
          setCommunityRequests(prev => [...prev, { ...request, author: user?.displayName || 'You' }]);
        }
      } else {
        setCommunityRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error updating public status:', error);
    }
  };

  useEffect(() => {
    // Load user's print requests from Snowflake (or show error)
    loadUserPrintRequests();
    loadCommunityRequests();
  }, [loadUserPrintRequests, loadCommunityRequests]);

  const handleCreatePrintRequest = () => {
    navigate('/print-request');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-progress';
      case 'Pending': return 'status-pending';
      default: return 'status-default';
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-section">
        <h2>Welcome back, {user?.displayName || user?.email}!</h2>
        <p>Manage your 3D printing requests and explore the community.</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          <p>{error}</p>
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{printRequests.length}</h3>
          <p>Total Requests</p>
        </div>
        <div className="stat-card">
          <h3>{printRequests.filter(req => req.status === 'Completed').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{printRequests.filter(req => req.status === 'In Progress').length}</h3>
          <p>In Progress</p>
        </div>
        <div className="stat-card">
          <h3>${printRequests.reduce((sum, req) => sum + (req.cost || 0), 0).toFixed(2)}</h3>
          <p>Total Spent</p>
        </div>
      </div>

      <div className="recent-requests">
        <h3>Recent Print Requests</h3>
        {loading ? (
          <div className="loading">Loading your requests...</div>
        ) : printRequests.length > 0 ? (
          <div className="requests-list">
            {printRequests.slice(0, 3).map(request => (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <h4>{request.title}</h4>
                  <p>{request.description}</p>
                  <div className="request-meta">
                    <span className={`status ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="date">{request.date}</span>
                    <span className="cost">${request.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-requests">
            <p>No print requests yet. Create your first one!</p>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <button className="btn btn-primary btn-large" onClick={handleCreatePrintRequest}>
          Create New Print Request
        </button>
        <button className="btn btn-secondary" onClick={() => setActiveTab('community')}>
          Browse Community
        </button>
      </div>
    </div>
  );

  const renderCommunity = () => (
    <div className="community-content">
      <div className="community-header">
        <h2>Community Print Requests</h2>
        <p>Discover and share 3D printing projects with the Rutgers Makerspace community.</p>
      </div>

      <div className="community-requests">
        {communityRequests.map(request => (
          <div key={request.id} className="community-item">
            <div className="community-item-header">
              <h3>{request.title}</h3>
              <div className="community-meta">
                <span className="author">by {request.author}</span>
                <span className="date">{request.date}</span>
              </div>
            </div>
            <p className="community-description">{request.description}</p>
            
            {/* 3D Model Viewer */}
            <div className="model-viewer-container">
              <ModelViewer 
                modelUrl={request.modelUrl}
                fallbackImage={request.fallbackImage}
                width="100%"
                height="200px"
                showControls={true}
                autoRotate={true}
              />
            </div>
            
            <div className="community-meta-details">
              <span className="material">{request.material} - {request.color}</span>
            </div>
            
            <div className="community-stats">
              <span className="likes">❤️ {request.likes}</span>
              <span className="downloads">📥 {request.downloads}</span>
            </div>
            <div className="community-actions">
              <button className="btn btn-outline">View Details</button>
              <button className="btn btn-outline">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="history-content">
      <div className="history-header">
        <h2>Print Request History</h2>
        <p>View all your past and current print requests.</p>
      </div>

      {loading ? (
        <div className="loading">Loading your history...</div>
      ) : printRequests.length > 0 ? (
        <div className="history-list">
          {printRequests.map(request => (
            <div key={request.id} className="history-item">
              <div className="history-item-main">
                <h3>{request.title}</h3>
                <p>{request.description}</p>
              </div>
              {/* 3D Model Viewer */}
              <div className="model-viewer-container">
                <h4>3D Model Preview</h4>
                <ModelViewer 
                  modelUrl={request.modelUrl}
                  fallbackImage={request.fallbackImage}
                  width="100%"
                  height="250px"
                  showControls={true}
                  autoRotate={true}
                />
              </div>
              
              <div className="history-item-details">
                <div className="detail-group">
                  <label>Status:</label>
                  <span className={`status ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="detail-group">
                  <label>Date:</label>
                  <span>{request.date}</span>
                </div>
                <div className="detail-group">
                  <label>Material:</label>
                  <span>{request.material} - {request.color}</span>
                </div>
                <div className="detail-group">
                  <label>Cost:</label>
                  <span>${request.cost}</span>
                </div>
              </div>
              
              {/* Make Public Toggle */}
              <div className="public-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={request.isPublic}
                    onChange={() => togglePublicStatus(request.id, request.isPublic)}
                    className="toggle-input"
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">
                    {request.isPublic ? 'Public' : 'Private'}
                  </span>
                </label>
                <small>
                  {request.isPublic 
                    ? 'This project is visible in the community' 
                    : 'This project is private to you only'
                  }
                </small>
              </div>
              <div className="history-item-actions">
                <button className="btn btn-outline">View Details</button>
                {request.status === 'Completed' && (
                  <button className="btn btn-outline">Download Files</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-history">
          <p>No print request history found.</p>
          <button className="btn btn-primary" onClick={handleCreatePrintRequest}>
            Create Your First Request
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="user-dashboard-page">
      <main className="main-content">
        <div className="container">
          <div className="dashboard-container">
            <div className="dashboard-sidebar">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h3>{user?.displayName || 'User'}</h3>
                  <p>{user?.email}</p>
                </div>
              </div>
              
              <nav className="dashboard-nav">
                <button 
                  className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Dashboard
                </button>
                <button 
                  className={`nav-item ${activeTab === 'community' ? 'active' : ''}`}
                  onClick={() => setActiveTab('community')}
                >
                  🌐 Community
                </button>
                <button 
                  className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  📋 History
                </button>
              </nav>
            </div>

            <div className="dashboard-main">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'community' && renderCommunity()}
              {activeTab === 'history' && renderHistory()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
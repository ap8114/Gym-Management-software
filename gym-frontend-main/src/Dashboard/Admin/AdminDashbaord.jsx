import React, { useEffect, useRef, useState } from 'react';
import { 
  RiUserLine, 
  RiCalendarCheckLine, 
  RiTeamLine,
  RiUserAddLine,
  RiCalendarLine,
  RiStoreLine
} from 'react-icons/ri';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as echarts from 'echarts';
import axiosInstance from '../../Api/axiosInstance';
import GetAdminId from '../../Api/GetAdminId';

const AdminDashboard = () => {
  const adminId = GetAdminId();
  const memberGrowthChartRef = useRef(null);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartInitialized, setChartInitialized] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!adminId) {
        setError("Admin ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Updated API endpoint to include adminId
        const response = await axiosInstance.get(`auth/admindashboard/${adminId}`);
        
        if (response.data.success && response.data.data) {
          setDashboardData(response.data.data);
          setError(null);
        } else {
          setError("Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [adminId]);

  // Initialize chart when component mounts and data is available
  useEffect(() => {
    if (!memberGrowthChartRef.current || !dashboardData) return;

    // Initialize chart
    const chart = echarts.init(memberGrowthChartRef.current);
    setChartInitialized(true);
    
    // Handle window resize
    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      setChartInitialized(false);
    };
  }, [dashboardData]);

  // Update chart when data changes
  useEffect(() => {
    if (!chartInitialized || !memberGrowthChartRef.current || !dashboardData) return;

    try {
      // Get chart instance
      const chart = echarts.getInstanceByDom(memberGrowthChartRef.current);
      if (!chart) return;
      
      // Generate dynamic data based on dashboard data
      const memberGrowthData = generateMemberGrowthData(dashboardData);
      
      const memberGrowthOption = {
        animation: false,
        grid: { 
          top: 20, 
          right: 20, 
          bottom: 40, 
          left: 40 
        },
        xAxis: {
          type: 'category',
          data: memberGrowthData.months,
          axisLine: { show: true, lineStyle: { color: '#E5E7EB' } },
          axisTick: { show: true, lineStyle: { color: '#E5E7EB' } },
          axisLabel: { color: '#6B7280', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          axisLine: { show: true, lineStyle: { color: '#E5E7EB' } },
          axisTick: { show: true, lineStyle: { color: '#E5E7EB' } },
          axisLabel: { color: '#6B7280', fontSize: 12 },
          splitLine: { lineStyle: { color: '#F3F4F6' } }
        },
        series: [{
          data: memberGrowthData.values,
          type: 'line',
          smooth: true,
          lineStyle: { color: '#2f6a87', width: 3 },
          itemStyle: { color: '#2f6a87' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(47, 106, 135, 0.3)' },
                { offset: 1, color: 'rgba(47, 106, 135, 0.05)' }
              ]
            }
          },
          showSymbol: true,
          symbolSize: 6
        }],
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#E5E7EB',
          textStyle: { color: '#1F2937' },
          formatter: function(params) {
            return `${params[0].name}<br/>Members: ${params[0].value}`;
          }
        }
      };
      
      chart.setOption(memberGrowthOption);
    } catch (error) {
      console.error("Error updating member growth chart:", error);
    }
  }, [chartInitialized, dashboardData]);

  // Generate member growth data based on dashboard data
  const generateMemberGrowthData = (data) => {
    if (!data || !data.memberGrowth || data.memberGrowth.length === 0) {
      return {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [0, 0, 0, 0, 0, 0]
      };
    }
    
    // Extract months and counts from API data
    const months = data.memberGrowth.map(item => item.month);
    const values = data.memberGrowth.map(item => item.count);
    
    // If we have less than 6 months of data, pad with zeros
    while (months.length < 6) {
      months.push('Month ' + (months.length + 1));
      values.push(0);
    }
    
    return {
      months: months,
      values: values
    };
  };

  // Format time for activities
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'member':
        return <RiUserAddLine className="text-success" />;
      case 'payment':
        return <RiMoneyDollarCircleLine className="text-primary" />;
      case 'booking':
      case 'class_booking':
        return <RiCalendarLine className="text-warning" />;
      case 'staff':
        return <RiUserLine className="text-info" />;
      default:
        return <RiCalendarCheckLine className="text-secondary" />;
    }
  };

  // Get icon background color for activity type
  const getActivityIconBg = (type) => {
    switch(type) {
      case 'member':
        return 'bg-success bg-opacity-10';
      case 'payment':
        return 'bg-primary bg-opacity-10';
      case 'booking':
      case 'class_booking':
        return 'bg-warning bg-opacity-10';
      case 'staff':
        return 'bg-info bg-opacity-10';
      default:
        return 'bg-secondary bg-opacity-10';
    }
  };

  // Parse activity text to extract title and description
  const parseActivityText = (activityText) => {
    const parts = activityText.split(': ');
    if (parts.length > 1) {
      return {
        title: parts[0],
        description: parts[1]
      };
    }
    return {
      title: activityText,
      description: ''
    };
  };

  // Additional activities to show when "View All" is clicked
  const additionalActivities = [
    {
      id: 5,
      type: 'equipment-maintenance',
      icon: <RiStoreLine className="text-secondary" />,
      title: 'Equipment maintenance',
      description: 'Treadmill #5 scheduled for maintenance',
      time: '2 hours ago'
    },
    {
      id: 6,
      type: 'membership-renewal',
      icon: <RiCalendarCheckLine className="text-success" />,
      title: 'Membership renewal',
      description: 'David Williams renewed annual membership',
      time: '3 hours ago'
    },
    {
      id: 7,
      type: 'class-cancellation',
      icon: <RiCalendarLine className="text-danger" />,
      title: 'Class cancellation',
      description: 'Evening Yoga class cancelled due to instructor illness',
      time: '4 hours ago'
    },
    {
      id: 8,
      type: 'new-staff',
      icon: <RiUserAddLine className="text-primary" />,
      title: 'New staff member',
      description: 'James Smith joined as Personal Trainer',
      time: '5 hours ago'
    }
  ];

  const handleViewAllActivities = () => {
    setShowAllActivities(!showAllActivities);
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-100 min-vh-100 p-0 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-100 min-vh-100 p-0 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-100 min-vh-100 p-0">
      <div className="p-4">
        <div className="mb-4">
          <h1 className="fw-bold">Dashboard Overview</h1>
          <p className="text-muted">Welcome back! Here's what's happening at your gym today.</p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="row g-3 mb-4">
          {/* Total Branches Card */}
          <div className="col-6 col-md-4 col-lg">
            <div className="card shadow-sm h-100" data-testid="total-branches-card">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-danger bg-opacity-10 p-2 rounded me-2">
                      <RiStoreLine className="text-danger fs-4 fs-md-5" />
                    </div>
                  </div>
                  <h3 className="h2 fw-bold mb-1" data-testid="total-branches-value">{dashboardData?.totalBranches || 0}</h3>
                  <p className="text-muted small mb-0">Total Branches</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Members Card */}
          <div className="col-6 col-md-4 col-lg">
            <div className="card shadow-sm h-100" data-testid="total-members-card">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded me-2">
                      <RiUserLine className="text-primary fs-4 fs-md-5" />
                    </div>
                  </div>
                  <h3 className="h2 fw-bold mb-1" data-testid="total-members-value">{dashboardData?.totalMembers || 0}</h3>
                  <p className="text-muted small mb-0">Total Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Staff Card */}
          <div className="col-6 col-md-4 col-lg">
            <div className="card shadow-sm h-100" data-testid="total-staff-card">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-info bg-opacity-10 p-2 rounded me-2">
                      <RiTeamLine className="text-info fs-4 fs-md-5" />
                    </div>
                  </div>
                  <h3 className="h2 fw-bold mb-1" data-testid="total-staff-value">{dashboardData?.totalStaff || 0}</h3>
                  <p className="text-muted small mb-0">Total Staff</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Member Check-ins Card */}
          <div className="col-6 col-md-4 col-lg">
            <div className="card shadow-sm h-100" data-testid="today-member-checkins-card">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 p-2 rounded me-2">
                      <RiCalendarCheckLine className="text-success fs-4 fs-md-5" />
                    </div>
                  </div>
                  <h3 className="h2 fw-bold mb-1" data-testid="today-member-checkins-value">{dashboardData?.todaysMemberCheckins || 0}</h3>
                  <p className="text-muted small mb-0">Today's Member Check-ins</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Staff Check-ins Card */}
          <div className="col-6 col-md-4 col-lg">
            <div className="card shadow-sm h-100" data-testid="today-staff-checkins-card">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-warning bg-opacity-10 p-2 rounded me-2">
                      <RiUserLine className="text-warning fs-4 fs-md-5" />
                    </div>
                  </div>
                  <h3 className="h2 fw-bold mb-1" data-testid="today-staff-checkins-value">{dashboardData?.todaysStaffCheckins || 0}</h3>
                  <p className="text-muted small mb-0">Today's Staff Check-ins</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-lg-12">
            <div className="card shadow-sm h-100" data-testid="member-growth-chart">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                  <h3 className="h5 fw-semibold mb-2 mb-md-0">Member Growth</h3>
                </div>
              </div>
              <div className="card-body">
                <div ref={memberGrowthChartRef} style={{ height: '300px', width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="row g-3">
          <div className="col-12 col-lg-12">
            <div className="card shadow-sm h-100" data-testid="recent-activities-section">
              <div className="card-header bg-white border-0 pt-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                  <h3 className="h5 fw-semibold mb-2 mb-md-0">Recent Activities</h3>
                  <button 
                    className="btn btn-sm btn-link text-primary p-0" 
                    data-testid="view-all-activities-btn"
                    onClick={handleViewAllActivities}
                  >
                    {showAllActivities ? 'Show Less' : 'View All'}
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  {/* API Activities */}
                  {dashboardData?.recentActivities && dashboardData.recentActivities.map((activity, index) => {
                    const { title, description } = parseActivityText(activity.activity);
                    return (
                      <div key={index} className="d-flex align-items-center p-3 border rounded">
                        <div className={`${getActivityIconBg(activity.type)} p-2 rounded-circle me-3`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-grow-1">
                          <p className="fw-medium mb-0">{title}</p>
                          <p className="text-muted small mb-0">{description}</p>
                        </div>
                        <span className="text-muted small">{formatTime(activity.time)}</span>
                      </div>
                    );
                  })}
                  
                  {/* Additional activities shown when "View All" is clicked */}
                  {showAllActivities && additionalActivities.map(activity => (
                    <div key={activity.id} className="d-flex align-items-center p-3 border rounded">
                      <div className="bg-secondary bg-opacity-10 p-2 rounded-circle me-3">
                        {activity.icon}
                      </div>
                      <div className="flex-grow-1">
                        <p className="fw-medium mb-0">{activity.title}</p>
                        <p className="text-muted small mb-0">{activity.description}</p>
                      </div>
                      <span className="text-muted small">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
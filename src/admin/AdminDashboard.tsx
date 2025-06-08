import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  Users,
  Route,
  BarChart3,
  Settings,
  Menu,
  X,
  UserCheck,
  Shield,
  LogOut,
  Home,
  FileText,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const sidebarItems = [
    {
      id: 'pending-agents',
      name: 'Pending Agents',
      icon: UserCheck,
      description: 'Review agent applications',
      badge: '3',
      color: 'bg-orange-100 text-orange-700',
      path: '/admin/pending-agents'
    },
    {
      id: 'users',
      name: 'Manage Users',
      icon: Users,
      description: 'User management',
      badge: '24',
      color: 'bg-blue-100 text-blue-700',
      path: '/admin/users'
    },
    {
      id: 'routes',
      name: 'Manage Routes',
      icon: Route,
      description: 'Route administration',
      path: '/admin/routes'
    },
    {
      id: 'invoices',
      name: 'Invoices',
      icon: FileText,
      description: 'View and manage invoices',
      badge: '12',
      color: 'bg-green-100 text-green-700',
      path: '/admin/invoices'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      description: 'Analytics & reports',
      path: '/admin/reports'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'System settings',
      path: '/admin/settings'
    }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      alert('Logged out successfully!');
    }
  };

  const getCurrentPageTitle = () => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-lg shadow-2xl transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-200/60
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-18 px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-teal-100">Management System</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 relative
                    ${isActive
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <div className={`
                    flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg mr-3
                    ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'}
                  `}>
                    <item.icon className={`
                      w-5 h-5
                      ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-700'}
                    `} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{item.name}</div>
                      {item.badge && (
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${isActive ? 'bg-white/20 text-white' : item.color || 'bg-teal-100 text-teal-700'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-teal-100' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-200 hover:shadow-md"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-200/60 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold text-slate-800">{getCurrentPageTitle()}</h2>
                <p className="text-sm text-slate-500">Manage your system efficiently</p>
              </div>
            </div>

            {/* Search bar */}
            <div className="hidden md:flex items-center max-w-md mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Quick actions */}
              <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors duration-200">
                <Home className="w-4 h-4 mr-2" />
                Home
              </button>

              {/* Admin profile */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">A</span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-slate-700">Admin</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Render nested routes */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
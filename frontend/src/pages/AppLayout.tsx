import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-200 px-4 py-2 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">World Operation</h1>
            <div className="text-sm text-gray-500">Fiction Writer</div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <span>{user?.displayName || user?.email}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          
          <nav className="flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1 rounded text-sm transition-colors ${
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
            >
              Write
            </NavLink>
            
            <NavLink
              to="/entities"
              className={({ isActive }) =>
                `px-3 py-1 rounded text-sm transition-colors ${
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
            >
              Entities
            </NavLink>
            
            <NavLink
              to="/commits"
              className={({ isActive }) =>
                `px-3 py-1 rounded text-sm transition-colors ${
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
            >
              Commits
            </NavLink>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

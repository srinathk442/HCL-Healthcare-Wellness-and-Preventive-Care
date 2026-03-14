import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2">
              <Activity className="h-8 w-8 text-medical-blue" />
              <span className="font-bold text-xl tracking-tight text-slate-900">HealthGuard</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm text-slate-600 hidden md:block flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                    user.role === 'provider' ? 'bg-indigo-100 text-indigo-700' : 'bg-medical-blue/10 text-medical-blue'
                  }`}>
                    {user.role}
                  </span>
                  <span>Logged in as <span className="font-semibold text-slate-900">{user.email || user.name || 'User'}</span></span>
                </div>
                <Link
                  to={user.role === 'patient' ? '/patient/dashboard' : '/provider/dashboard'}
                  className="text-slate-600 hover:text-medical-blue transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {user.role === 'patient' && (
                  <Link
                    to="/patient/goals"
                    className="text-slate-600 hover:text-medical-blue transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Goals
                  </Link>
                )}
                <Link
                  to={user.role === 'patient' ? '/patient/profile' : '/provider/profile'}
                  className="text-slate-600 hover:text-medical-blue transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-danger-red transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-medical-blue px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-medical-blue hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

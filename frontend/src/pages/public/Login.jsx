import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api, { getErrorMessage } from '../../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login({ email, role: data.role }, data.access_token);
      addToast('Logged in successfully!');
      
      if (data.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error(error);
      addToast(getErrorMessage(error, 'Invalid credentials'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-8">Sign in to your account</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email address</label>
            <input
              type="email" required
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-medical-blue transition-colors"
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password" required
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-medical-blue transition-colors"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-medical-blue hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="font-medium text-medical-blue hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

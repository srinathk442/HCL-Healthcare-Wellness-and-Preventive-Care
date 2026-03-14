import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import api, { getErrorMessage } from '../../api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', password: '', role: 'patient', consent_given: false
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev, [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      addToast('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      addToast(getErrorMessage(error, 'Registration failed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-8">Create your account</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email address</label>
            <input type="email" name="email" required className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue" value={formData.email} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" required className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue" value={formData.password} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select name="role" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue" value={formData.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="provider">Provider</option>
            </select>
          </div>
          <div className="flex items-start mt-2">
            <div className="flex items-center h-5">
              <input id="consent" name="consent_given" type="checkbox" required className="w-5 h-5 text-medical-blue border-gray-300 rounded focus:ring-medical-blue" checked={formData.consent_given} onChange={handleChange} />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="consent" className="font-medium text-slate-700">Consent for data processing</label>
              <p className="text-slate-500 text-xs mt-1">I give consent to process my health data according to the privacy policy.</p>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-medical-blue hover:bg-sky-600 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue disabled:opacity-50 transition-colors">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-medium text-medical-blue hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

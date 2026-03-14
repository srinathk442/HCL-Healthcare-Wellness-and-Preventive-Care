import React, { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const emptyProfile = {
  full_name: '',
  age: '',
  gender: '',
  phone: '',
  allergies: '',
  current_medications: '',
  blood_type: '',
  emergency_contact: '',
};

const Profile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patient/profile/me');
      setProfile({
        full_name: data.full_name || '',
        age: data.age ?? '',
        gender: data.gender || '',
        phone: data.phone || '',
        allergies: (data.allergies || []).join(', '),
        current_medications: (data.current_medications || []).join(', '),
        blood_type: data.blood_type || '',
        emergency_contact: data.emergency_contact || '',
      });
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to load patient profile'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/patient/profile/me', {
        full_name: profile.full_name || null,
        age: profile.age === '' ? null : Number(profile.age),
        gender: profile.gender || null,
        phone: profile.phone || null,
        allergies: profile.allergies
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        current_medications: profile.current_medications
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        blood_type: profile.blood_type || null,
        emergency_contact: profile.emergency_contact || null,
      });
      setIsEditing(false);
      addToast('Profile updated successfully!');
      loadProfile();
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update patient profile'), 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Patient Profile</h1>
        <button 
          onClick={() => setIsEditing((current) => !current)}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${isEditing ? 'bg-success-green text-white hover:bg-green-600 shadow-sm' : 'bg-medical-blue text-white hover:bg-sky-600 shadow-sm'}`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Full Name</label>
              <input 
                type="text" name="full_name"
                disabled={!isEditing}
                value={profile.full_name} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Age</label>
              <input 
                type="number" name="age"
                disabled={!isEditing}
                value={profile.age} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Gender</label>
              <input
                type="text" name="gender"
                disabled={!isEditing}
                value={profile.gender} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Phone</label>
              <input
                type="text" name="phone"
                disabled={!isEditing}
                value={profile.phone} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Blood Type</label>
              <input 
                type="text" name="blood_type"
                disabled={!isEditing}
                value={profile.blood_type} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Emergency Contact</label>
              <input 
                type="text" name="emergency_contact"
                disabled={!isEditing}
                value={profile.emergency_contact} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Known Allergies</label>
              <textarea 
                name="allergies" rows="3"
                disabled={!isEditing}
                value={profile.allergies} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Current Medications</label>
              <textarea 
                name="current_medications" rows="3"
                disabled={!isEditing}
                value={profile.current_medications} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
          </div>
          {isEditing && (
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-success-green text-white font-bold hover:bg-green-600 shadow-sm"
            >
              Save Changes
            </button>
          )}
          {loading && <p className="text-sm text-slate-500">Loading profile...</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;

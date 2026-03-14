import React, { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const emptyProfile = {
  full_name: '',
  phone: '',
  specialization: '',
  license_number: '',
  hospital_or_clinic: '',
  years_of_experience: '',
};

const Profile = () => {
  const [profile, setProfile] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/provider/profile/me');
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        specialization: data.specialization || '',
        license_number: data.license_number || '',
        hospital_or_clinic: data.hospital_or_clinic || '',
        years_of_experience: data.years_of_experience ?? '',
      });
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to load provider profile'), 'error');
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
      await api.put('/provider/profile/me', {
        full_name: profile.full_name || null,
        phone: profile.phone || null,
        specialization: profile.specialization || null,
        license_number: profile.license_number || null,
        hospital_or_clinic: profile.hospital_or_clinic || null,
        years_of_experience:
          profile.years_of_experience === '' ? null : Number(profile.years_of_experience),
      });
      setIsEditing(false);
      addToast('Provider profile updated successfully!');
      loadProfile();
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update provider profile'), 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Provider Profile</h1>
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
              <label className="block text-sm font-semibold text-slate-700">Phone</label>
              <input
                type="text" name="phone"
                disabled={!isEditing}
                value={profile.phone} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Specialization</label>
              <input 
                type="text" name="specialization"
                disabled={!isEditing}
                value={profile.specialization} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">License Number</label>
              <input 
                type="text" name="license_number"
                disabled={!isEditing}
                value={profile.license_number} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Clinic / Hospital Name</label>
              <input 
                type="text" name="hospital_or_clinic"
                disabled={!isEditing}
                value={profile.hospital_or_clinic} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Years of Experience</label>
              <input
                type="number" name="years_of_experience"
                disabled={!isEditing}
                value={profile.years_of_experience} onChange={handleChange}
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

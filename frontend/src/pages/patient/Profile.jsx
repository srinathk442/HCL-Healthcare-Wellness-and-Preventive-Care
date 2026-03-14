import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

const Profile = () => {
  const [profile, setProfile] = useState({
    bloodType: 'O+',
    allergies: 'Penicillin, Peanuts',
    medications: 'Lisinopril 10mg',
    emergencyContact: 'Jane Doe - 555-0192'
  });
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    addToast('Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Patient Profile</h1>
        <button 
          onClick={() => isEditing ? handleSave(new Event('submit')) : setIsEditing(true)}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${isEditing ? 'bg-success-green text-white hover:bg-green-600 shadow-sm' : 'bg-medical-blue text-white hover:bg-sky-600 shadow-sm'}`}
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Blood Type</label>
              <input 
                type="text" name="bloodType"
                disabled={!isEditing}
                value={profile.bloodType} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Emergency Contact</label>
              <input 
                type="text" name="emergencyContact"
                disabled={!isEditing}
                value={profile.emergencyContact} onChange={handleChange}
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
                name="medications" rows="3"
                disabled={!isEditing}
                value={profile.medications} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

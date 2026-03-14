import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

const Profile = () => {
  const [profile, setProfile] = useState({
    specialization: 'Cardiology',
    licenseNumber: 'MD-123456789',
    clinicName: 'HeartCare Center',
    clinicAddress: '123 Medical Parkway, Suite 100'
  });
  const [isEditing, setIsEditing] = useState(false);
  const { addToast } = useToast();

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    addToast('Provider Profile updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Provider Profile</h1>
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
                type="text" name="licenseNumber"
                disabled={!isEditing}
                value={profile.licenseNumber} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Clinic / Hospital Name</label>
              <input 
                type="text" name="clinicName"
                disabled={!isEditing}
                value={profile.clinicName} onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Clinic Address</label>
              <textarea 
                name="clinicAddress" rows="3"
                disabled={!isEditing}
                value={profile.clinicAddress} onChange={handleChange}
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

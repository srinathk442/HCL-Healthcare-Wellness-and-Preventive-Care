import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight } from 'lucide-react';
import api, { getErrorMessage } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadPatients = useCallback(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/provider/patients');
        const enriched = await Promise.all(
          data.map(async (patient) => {
            try {
              const complianceRes = await api.get(`/provider/patients/${patient.patient_id}/compliance`);
              const compliance = complianceRes.data;
              let complianceLabel = 'Needs Attention';
              if (compliance.missed_reminders > 0) {
                complianceLabel = 'Missed Reminder';
              } else if (compliance.total_goals > 0 && compliance.goals_with_recent_log === compliance.total_goals) {
                complianceLabel = 'On Track';
              }

              return {
                ...patient,
                complianceLabel,
                pending_reminders: compliance.pending_reminders,
              };
            } catch {
              return {
                ...patient,
                complianceLabel: 'Unknown',
                pending_reminders: 0,
              };
            }
          })
        );
        setPatients(enriched);
      } catch (error) {
        addToast(getErrorMessage(error, 'Failed to load assigned patients'), 'error');
      } finally {
        setLoading(false);
      }
  }, [addToast]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filteredPatients = patients.filter((p) =>
    (p.full_name || p.email).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Provider Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your assigned patients</p>
        </div>
        <div className="bg-medical-blue/10 text-medical-blue px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm">
          <Users className="w-5 h-5" />
          <span>{patients.length} Total Patients</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Patient</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Assigned At</th>
                <th className="px-6 py-4 font-semibold">Compliance Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.patient_id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{patient.full_name || 'Unnamed Patient'}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{patient.email}</td>
                  <td className="px-6 py-4 text-slate-600">{new Date(patient.assigned_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      patient.complianceLabel === 'On Track' 
                        ? 'bg-green-100 text-success-green border border-green-200' 
                        : 'bg-red-100 text-danger-red border border-red-200'
                    }`}>
                      {patient.complianceLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/provider/patient/${patient.patient_id}`}
                      className="inline-flex items-center justify-end gap-1 text-sm font-bold text-medical-blue hover:text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 italic">
                    {loading ? 'Loading patients...' : 'No assigned patients found. Patient assignment API is not wired into the UI yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

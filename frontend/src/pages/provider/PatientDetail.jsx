import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import api, { getErrorMessage } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadPatient = useCallback(async () => {
      setLoading(true);
      try {
        const [profileRes, complianceRes] = await Promise.all([
          api.get(`/provider/patients/${id}`),
          api.get(`/provider/patients/${id}/compliance`),
        ]);
        setPatient({
          profile: profileRes.data,
          compliance: complianceRes.data,
        });
      } catch (error) {
        addToast(getErrorMessage(error, 'Failed to load patient details'), 'error');
      } finally {
        setLoading(false);
      }
  }, [addToast, id]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  if (loading) {
    return <div className="p-8 text-center font-medium text-slate-500 animate-pulse">Loading patient data...</div>;
  }

  if (!patient) {
    return <div className="p-8 text-center font-medium text-slate-500">Patient details are unavailable.</div>;
  }

  const complianceLabel =
    patient.compliance.missed_reminders > 0
      ? 'Needs Attention'
      : patient.compliance.total_goals > 0 &&
          patient.compliance.goals_with_recent_log === patient.compliance.total_goals
        ? 'On Track'
        : 'In Progress';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to="/provider/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-medical-blue transition-colors mb-6 font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to assigned patients
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">{patient.compliance.full_name || 'Unnamed Patient'}</h1>
            <p className="text-lg text-slate-500 mt-1 font-medium">Patient ID: {patient.compliance.patient_id}</p>
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm uppercase tracking-wide ${
            complianceLabel === 'On Track' 
              ? 'bg-green-100 text-success-green border border-green-200' 
              : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
          }`}>
            {complianceLabel !== 'On Track' && <AlertTriangle className="w-4 h-4 mr-2" />}
            Status: {complianceLabel}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Patient Profile</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-100 rounded-lg">
                  <User className="text-medical-blue w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700">Full Name</span>
              </div>
              <span className="font-extrabold text-xl text-slate-900">{patient.profile.full_name || '--'}</span>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-100 rounded-lg">
                  <Mail className="text-medical-blue w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700">Email</span>
              </div>
              <span className="font-extrabold text-xl text-slate-900">{patient.compliance.email}</span>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Phone className="text-indigo-600 w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700">Phone</span>
              </div>
              <span className="font-extrabold text-xl text-slate-900">{patient.profile.phone || '--'}</span>
            </div>
          </div>
        </section>

        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Compliance Summary</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShieldCheck className="text-success-green w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700">Goals with Recent Logs</span>
              </div>
              <span className="font-extrabold text-xl text-slate-900">
                {patient.compliance.goals_with_recent_log} / {patient.compliance.total_goals}
              </span>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-slate-900">Pending Reminders</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Upcoming preventive care items</p>
              </div>
              <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-yellow-100 border-yellow-200 text-yellow-700">
                {patient.compliance.pending_reminders}
              </span>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-bold text-slate-900">Missed Reminders</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Items that need provider follow-up</p>
              </div>
              <span className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-red-100 border-red-200 text-danger-red">
                {patient.compliance.missed_reminders}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientDetail;

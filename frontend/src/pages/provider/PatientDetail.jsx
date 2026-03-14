import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, Droplets, Moon, AlertTriangle } from 'lucide-react';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    // Mock API Fetch
    setPatient({
      id,
      name: parseInt(id) === 2 ? 'Bob Jones' : 'Alice Smith',
      age: parseInt(id) === 2 ? 62 : 45,
      compliance: parseInt(id) === 2 ? 'Missed Checkup' : 'On Track',
      logs: { steps: 8000, water: 6, sleep: 7 },
      reminders: [
        { id: 1, title: 'Annual Checkup', date: '2026-03-01', status: parseInt(id) === 2 ? 'missed' : 'done' },
        { id: 2, title: 'HBA1C Test', date: '2026-04-10', status: 'pending' },
      ]
    });
  }, [id]);

  if (!patient) return <div className="p-8 text-center font-medium text-slate-500 animate-pulse">Loading patient data...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to="/provider/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-medical-blue transition-colors mb-6 font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to assigned patients
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">{patient.name}</h1>
            <p className="text-lg text-slate-500 mt-1 font-medium">Patient ID: #{patient.id} • Age: {patient.age}</p>
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm uppercase tracking-wide ${
            patient.compliance === 'On Track' 
              ? 'bg-green-100 text-success-green border border-green-200' 
              : 'bg-red-100 text-danger-red border border-red-200'
          }`}>
            {patient.compliance === 'Missed Checkup' && <AlertTriangle className="w-4 h-4 mr-2" />}
            Status: {patient.compliance}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Wellness Logs */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Wellness Logs</h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-100 rounded-lg">
                  <Activity className="text-medical-blue w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700">Daily Steps</span>
              </div>
              <span className="font-extrabold text-xl text-slate-900">{patient.logs.steps} <span className="text-sm font-medium text-slate-500">/ 10000</span></span>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-100 rounded-lg">
                  <Droplets className="text-medical-blue w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700">Water Intake</span>
              </div>
              <span className="font-extrabold text-xl text-slate-900">{patient.logs.water} <span className="text-sm font-medium text-slate-500">/ 8</span></span>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Moon className="text-indigo-600 w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700">Sleep</span>
              </div>
              <span className="font-extrabold text-xl text-slate-900">{patient.logs.sleep} <span className="text-sm font-medium text-slate-500">/ 8</span></span>
            </div>
          </div>
        </section>

        {/* Reminders & Compliance */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Preventive Reminders</h2>
          <div className="space-y-4">
            {patient.reminders.map(rem => (
              <div key={rem.id} className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-bold text-slate-900">{rem.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">Scheduled: {rem.date}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  rem.status === 'done' ? 'bg-green-100 border-green-200 text-success-green' :
                  rem.status === 'missed' ? 'bg-red-100 border-red-200 text-danger-red' :
                  'bg-yellow-100 border-yellow-200 text-yellow-700'
                }`}>
                  {rem.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientDetail;

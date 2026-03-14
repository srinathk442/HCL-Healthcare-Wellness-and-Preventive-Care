import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock API
    setPatients([
      { id: 1, name: 'Alice Smith', age: 45, condition: 'Hypertension', compliance: 'On Track' },
      { id: 2, name: 'Bob Jones', age: 62, condition: 'Type 2 Diabetes', compliance: 'Missed Checkup' },
      { id: 3, name: 'Charlie Davis', age: 31, condition: 'Asthma', compliance: 'On Track' },
    ]);
  }, []);

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
                <th className="px-6 py-4 font-semibold">Patient Name</th>
                <th className="px-6 py-4 font-semibold">Age</th>
                <th className="px-6 py-4 font-semibold">Primary Condition</th>
                <th className="px-6 py-4 font-semibold">Compliance Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{patient.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{patient.age}</td>
                  <td className="px-6 py-4 text-slate-600">{patient.condition}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      patient.compliance === 'On Track' 
                        ? 'bg-green-100 text-success-green border border-green-200' 
                        : 'bg-red-100 text-danger-red border border-red-200'
                    }`}>
                      {patient.compliance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/provider/patient/${patient.id}`}
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
                    No patients found matching your search.
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

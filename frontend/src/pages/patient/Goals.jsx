import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';

const Goals = () => {
  const [logType, setLogType] = useState('steps');
  const [amount, setAmount] = useState('');
  const { addToast } = useToast();

  const handleLog = (e) => {
    e.preventDefault();
    if (!amount) return;
    // Mock API call
    addToast(`Successfully logged ${amount} ${logType === 'water' ? 'glasses of water' : logType}!`);
    setAmount('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">My Wellness Goals</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Log Activity</h2>
        <form onSubmit={handleLog} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Activity Type</label>
              <select 
                value={logType} 
                onChange={(e) => setLogType(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue bg-white"
              >
                <option value="steps">Steps</option>
                <option value="water">Water (Glasses)</option>
                <option value="sleep">Sleep (Hours)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Amount</label>
              <input 
                type="number" 
                required 
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue flex-1"
                placeholder="Enter value..."
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-medical-blue text-white font-bold rounded-lg hover:bg-sky-600 transition-colors shadow-sm"
          >
            Log Activity
          </button>
        </form>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Goal History</h2>
        <div className="text-slate-500 italic text-sm p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No history yet. Start logging your activities to see them here!
        </div>
      </div>
    </div>
  );
};

export default Goals;

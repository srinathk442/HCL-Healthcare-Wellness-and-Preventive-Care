import React, { useState, useEffect } from 'react';
import { Activity, Droplets, Moon, Bell, CheckCircle2, Clock } from 'lucide-react';

const Dashboard = () => {
  const [goals, setGoals] = useState({ steps: 4500, water: 3, sleep: 6 });
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // Mock fetching reminders
    setReminders([
      { id: 1, title: 'Annual Checkup', date: '2026-04-15', status: 'pending' },
      { id: 2, title: 'Flu Shot', date: '2026-10-01', status: 'pending' },
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <section className="bg-medical-blue text-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Welcome Patient!</h1>
        <p className="text-lg opacity-90 mb-4">Here is your daily health tip:</p>
        <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm border border-white/30">
          <p className="font-medium text-white italic">"Drinking a glass of water first thing in the morning helps kickstart your metabolism."</p>
        </div>
      </section>

      {/* Wellness Goals */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Today's Wellness Goals</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-sky-100 text-medical-blue rounded-xl">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Steps</p>
              <p className="text-3xl font-extrabold text-slate-900">{goals.steps} <span className="text-sm font-normal text-slate-500">/ 10000</span></p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-sky-100 text-medical-blue rounded-xl">
              <Droplets className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Water (Glasses)</p>
              <p className="text-3xl font-extrabold text-slate-900">{goals.water} <span className="text-sm font-normal text-slate-500">/ 8</span></p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Moon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sleep (Hours)</p>
              <p className="text-3xl font-extrabold text-slate-900">{goals.sleep} <span className="text-sm font-normal text-slate-500">/ 8</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Preventive Reminders */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-6 h-6 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">Preventive Reminders</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-orange-500 bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{reminder.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">Due: {reminder.date}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-success-green hover:border-success-green transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Done
                </button>
              </li>
            ))}
            {reminders.length === 0 && (
              <li className="p-6 text-center text-slate-500">No upcoming reminders!</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

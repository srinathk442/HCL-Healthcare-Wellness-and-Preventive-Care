import React, { useCallback, useEffect, useState } from 'react';
import { Activity, Bell, CheckCircle2, Clock, Droplets, Moon } from 'lucide-react';
import api, { getErrorMessage } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const icons = {
  steps: {
    label: 'Steps',
    icon: Activity,
    iconClass: 'bg-sky-100 text-medical-blue',
    defaultTarget: 'steps',
  },
  water: {
    label: 'Water (Glasses)',
    icon: Droplets,
    iconClass: 'bg-sky-100 text-medical-blue',
    defaultTarget: 'glasses',
  },
  sleep: {
    label: 'Sleep (Hours)',
    icon: Moon,
    iconClass: 'bg-indigo-100 text-indigo-600',
    defaultTarget: 'hours',
  },
};

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [tip, setTip] = useState('Stay consistent with your wellness habits today.');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsRes, remindersRes, tipsRes] = await Promise.all([
        api.get('/goals'),
        api.get('/reminders'),
        api.get('/public/health-info'),
      ]);

      const goalsWithProgress = await Promise.all(
        goalsRes.data.map(async (goal) => {
          const logsRes = await api.get(`/goals/${goal._id}/logs`);
          return {
            ...goal,
            latestValue: logsRes.data[0]?.logged_value || 0,
          };
        })
      );

      setGoals(goalsWithProgress);
      setReminders(remindersRes.data);
      setTip(tipsRes.data.tips?.[0] || 'Stay consistent with your wellness habits today.');
    } catch (error) {
      console.error(error);
      addToast(getErrorMessage(error, 'Failed to load dashboard'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleReminderDone = async (reminderId) => {
    try {
      await api.put(`/reminders/${reminderId}/status`, { status: 'completed' });
      addToast('Reminder updated successfully!');
      loadDashboard();
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to update reminder'), 'error');
    }
  };

  const goalCards = ['steps', 'water', 'sleep'].map((type) => {
    const goal = goals.find((item) => item.goal_type === type);
    return {
      type,
      current: goal?.latestValue || 0,
      target: goal?.target_value || 0,
      unit: goal?.unit || icons[type].defaultTarget,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <section className="bg-medical-blue text-white p-8 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold mb-2">Welcome Patient!</h1>
        <p className="text-lg opacity-90 mb-4">Here is your daily health tip:</p>
        <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm border border-white/30">
            <p className="font-medium text-white italic">"{tip}"</p>
        </div>
      </section>

      {/* Wellness Goals */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Today's Wellness Goals</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {goalCards.map((goal) => {
            const goalMeta = icons[goal.type];
            const GoalIcon = goalMeta.icon;

            return (
              <div key={goal.type} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`p-3 rounded-xl ${goalMeta.iconClass}`}>
                  <GoalIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{goalMeta.label}</p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {loading ? '...' : goal.current}{' '}
                    <span className="text-sm font-normal text-slate-500">/ {goal.target || '--'}</span>
                  </p>
                </div>
              </div>
            );
          })}
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
              <li key={reminder._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-orange-500 bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{reminder.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">Due: {reminder.due_date}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleReminderDone(reminder._id)}
                  disabled={reminder.status !== 'pending'}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-success-green hover:border-success-green transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {reminder.status === 'pending' ? 'Mark Done' : reminder.status}
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

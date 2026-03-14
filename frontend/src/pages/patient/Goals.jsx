import React, { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../../api';
import { useToast } from '../../contexts/ToastContext';

const unitByGoalType = {
  steps: 'steps',
  water: 'glasses',
  sleep: 'hours',
};

const today = new Date().toISOString().slice(0, 10);

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [logs, setLogs] = useState([]);
  const [goalForm, setGoalForm] = useState({
    goal_type: 'steps',
    target_value: 10000,
    unit: 'steps',
  });
  const [logForm, setLogForm] = useState({
    logged_value: '',
    log_date: today,
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
      if (data.length > 0) {
        setSelectedGoalId((current) =>
          current && data.some((goal) => goal._id === current) ? current : data[0]._id
        );
      } else {
        setSelectedGoalId('');
        setLogs([]);
      }
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to load goals'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const loadLogs = useCallback(async (goalId) => {
    if (!goalId) {
      setLogs([]);
      return;
    }
    try {
      const { data } = await api.get(`/goals/${goalId}/logs`);
      setLogs(data);
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to load goal history'), 'error');
    }
  }, [addToast]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    loadLogs(selectedGoalId);
  }, [loadLogs, selectedGoalId]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', {
        ...goalForm,
        target_value: Number(goalForm.target_value),
      });
      addToast('Goal created successfully!');
      await loadGoals();
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to create goal'), 'error');
    }
  };

  const handleLog = async (e) => {
    e.preventDefault();
    if (!selectedGoalId || !logForm.logged_value) {
      return;
    }

    try {
      await api.post(`/goals/${selectedGoalId}/log`, {
        logged_value: Number(logForm.logged_value),
        log_date: logForm.log_date,
      });
      addToast('Activity logged successfully!');
      setLogForm((current) => ({ ...current, logged_value: '' }));
      await Promise.all([loadGoals(), loadLogs(selectedGoalId)]);
    } catch (error) {
      addToast(getErrorMessage(error, 'Failed to log activity'), 'error');
    }
  };

  const handleGoalTypeChange = (value) => {
    setGoalForm({
      goal_type: value,
      target_value: value === 'steps' ? 10000 : 8,
      unit: unitByGoalType[value],
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">My Wellness Goals</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Create Goal</h2>
        <form onSubmit={handleCreateGoal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Goal Type</label>
              <select
                value={goalForm.goal_type}
                onChange={(e) => handleGoalTypeChange(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue bg-white"
              >
                <option value="steps">Steps</option>
                <option value="water">Water</option>
                <option value="sleep">Sleep</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Target Value</label>
              <input
                type="number"
                required
                min="1"
                value={goalForm.target_value}
                onChange={(e) => setGoalForm((current) => ({ ...current, target_value: e.target.value }))}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Unit</label>
              <input
                type="text"
                value={goalForm.unit}
                disabled
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-medical-blue text-white font-bold rounded-lg hover:bg-sky-600 transition-colors shadow-sm"
          >
            Create Goal
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Log Activity</h2>
        <form onSubmit={handleLog} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700">Goal</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue bg-white"
                disabled={goals.length === 0}
              >
                {goals.length === 0 ? (
                  <option value="">Create a goal first</option>
                ) : (
                  goals.map((goal) => (
                    <option key={goal._id} value={goal._id}>
                      {goal.goal_type} - target {goal.target_value} {goal.unit}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Amount</label>
              <input
                type="number"
                required
                min="0"
                value={logForm.logged_value}
                onChange={(e) => setLogForm((current) => ({ ...current, logged_value: e.target.value }))}
                className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue flex-1"
                placeholder="Enter value..."
                disabled={goals.length === 0}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Log Date</label>
            <input
              type="date"
              value={logForm.log_date}
              onChange={(e) => setLogForm((current) => ({ ...current, log_date: e.target.value }))}
              className="mt-1 block w-full md:w-80 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-medical-blue"
              disabled={goals.length === 0}
            />
          </div>
          <button 
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-medical-blue text-white font-bold rounded-lg hover:bg-sky-600 transition-colors shadow-sm disabled:opacity-50"
            disabled={goals.length === 0}
          >
            Log Activity
          </button>
        </form>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Goal History</h2>
        {loading ? (
          <div className="text-slate-500 italic text-sm p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Loading goals...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-slate-500 italic text-sm p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No history yet. Start logging your activities to see them here!
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div>
                  <p className="font-bold text-slate-900">{log.logged_value}</p>
                  <p className="text-sm text-slate-500">{log.log_date}</p>
                </div>
                <span className="rounded-full bg-medical-blue/10 px-3 py-1 text-xs font-bold uppercase text-medical-blue">
                  Logged
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;

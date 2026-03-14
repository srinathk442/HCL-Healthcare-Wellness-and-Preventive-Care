import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Heart, Shield } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-medical-blue text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Your Healthcare Wellness & Preventive Care Portal
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
            Take control of your health with personalized goals, preventive reminders, and seamless provider collaboration.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-white text-medical-blue px-8 py-3 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg">
              Get Started
            </Link>
            <Link to="/login" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-white/10 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Public Health Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Public Health Guidelines</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <Activity className="w-10 h-10 text-medical-blue mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Flu Prevention</h3>
            <p className="text-slate-600">Get your annual flu shot. Wash your hands frequently with soap and water for at least 20 seconds. Avoid close contact with people who are sick.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <Shield className="w-10 h-10 text-medical-blue mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">COVID-19 Safety</h3>
            <p className="text-slate-600">Stay up to date with vaccines. Improve ventilation in indoor spaces. Get tested if you have symptoms, and stay home if you are sick.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <Heart className="w-10 h-10 text-medical-blue mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Daily Wellness</h3>
            <p className="text-slate-600">Aim for 150 minutes of moderate aerobic activity weekly. Drink plenty of water, and ensure you get 7-9 hours of quality sleep each night.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

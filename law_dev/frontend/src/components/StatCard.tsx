import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-white/10 hover:bg-slate-800/80 transition-colors">
      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  );
};

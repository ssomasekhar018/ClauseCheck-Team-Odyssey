import React from 'react';

interface IssueProps {
  severity: 'High' | 'Medium' | 'Low' | string;
  text: string;
}

export const Issue: React.FC<IssueProps> = ({ severity, text }) => {
  const color =
    severity === "High"
      ? "text-red-400"
      : severity === "Medium"
      ? "text-yellow-400"
      : "text-green-400";
      
  const borderColor = 
    severity === "High"
      ? "border-red-400/20"
      : severity === "Medium"
      ? "border-yellow-400/20"
      : "border-green-400/20";

  return (
    <div className={`bg-slate-800/50 p-3 rounded-lg border ${borderColor} hover:bg-slate-800/70 transition-colors`}>
      <p className={`font-semibold ${color} flex items-center gap-2`}>
        {severity === 'High' && '🔴'}
        {severity === 'Medium' && '🟡'}
        {severity === 'Low' && '🟢'}
        {severity} Risk
      </p>
      <p className="text-sm text-slate-300 mt-1">{text}</p>
    </div>
  );
};

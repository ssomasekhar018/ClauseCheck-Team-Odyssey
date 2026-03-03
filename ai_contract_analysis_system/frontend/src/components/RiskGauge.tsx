import React from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  // Score 0-100. 100 is safe, 0 is risky.
  // We want to display "Safety Score".
  // But visually, maybe a circular progress.
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const color = score > 80 ? '#4ade80' : score > 50 ? '#facc15' : '#f87171';

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-700"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-bold text-white">{score}%</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">Safety</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ title, description, children, action }) => {
  return (
    <div className="px-6 py-8 md:px-12 md:py-10 text-slate-200 max-w-[1600px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex justify-between items-end border-b border-white/10 pb-6"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {title}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">{description}</p>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </motion.div>
      {children}
    </div>
  );
};

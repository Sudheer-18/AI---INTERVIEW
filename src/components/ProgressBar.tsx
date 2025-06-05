import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, className = '' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  // Color based on percentage
  let color = 'bg-red-500';
  if (percentage >= 80) color = 'bg-green-500';
  else if (percentage >= 60) color = 'bg-blue-500';
  else if (percentage >= 40) color = 'bg-yellow-500';
  
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full ${color} transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
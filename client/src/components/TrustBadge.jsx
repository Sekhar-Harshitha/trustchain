import React from 'react';
import { motion } from 'framer-motion';

const TrustBadge = ({ score, label, size = "sm" }) => {
  const isLarge = size === "lg";
  const radius = isLarge ? 50 : 25;
  const stroke = isLarge ? 8 : 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#00E676'; // success
    if (s >= 50) return '#FFB300'; // warning
    return '#FF5252'; // danger
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#E2E8F0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-text-primary ${isLarge ? 'text-3xl' : 'text-sm'}`}>
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className={`mt-2 font-medium uppercase tracking-wider ${isLarge ? 'text-sm' : 'text-[10px]'}`} style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default TrustBadge;

import React from 'react';
import { motion } from 'framer-motion';

const FloatingIcons = () => {
  const icons = ['💬', '🚀', '⭐', '🎯', '✨', '🔮'];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          className="absolute text-xl opacity-10"
          style={{
            left: `${15 + index * 18}%`,
            top: `${20 + index * 10}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingIcons;
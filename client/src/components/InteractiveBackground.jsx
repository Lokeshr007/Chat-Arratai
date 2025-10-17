import React from 'react';
import { motion } from 'framer-motion';

const InteractiveBackground = ({ cursorPosition, onInteract }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 1,
        }}
      />

      {/* Interactive particles */}
      <motion.div
        className="absolute w-2 h-2 bg-white/10 rounded-full blur-sm"
        style={{
          left: cursorPosition.x - 4,
          top: cursorPosition.y - 4,
        }}
        animate={{
          scale: [1, 2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </div>
  );
};

export default InteractiveBackground;
import React from 'react';

const ThreeScene = ({ cursorPosition, isInteractive, activeView }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-purple-900/30 to-blue-900/20" />
      
      {/* Dynamic cursor effect */}
      <div 
        className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
        style={{
          left: `${cursorPosition.x - 192}px`,
          top: `${cursorPosition.y - 192}px`,
          transform: `scale(${isInteractive ? 1.5 : 1})`,
          opacity: isInteractive ? 0.3 : 0.1
        }}
      />
    </div>
  );
};

export default ThreeScene;
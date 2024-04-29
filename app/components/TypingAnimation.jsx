import React, { useState, useEffect } from 'react';
import './TypingAnimation.css'; // Import the CSS styles

const TypingAnimation = ({ lines, activeLine, setActiveLine }) => {

  useEffect(() => {
    if (activeLine < lines.length) {
      const timer = setTimeout(() => {
        setActiveLine(activeLine + 1);
      }, 1000); // Duration of the typing effect per line
      return () => clearTimeout(timer);
    }
  }, [activeLine, lines.length]);

  return (
    <div>
      {lines.map((line, index) => (
        <div key={index} className="line" style={{ animationPlayState: index === activeLine ? 'running' : 'paused' }}>
          {line}
        </div>
      ))}
    </div>
  );
};

export default TypingAnimation;

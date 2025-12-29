import React from 'react';

interface XIconProps {
  className?: string;
}

const XIcon: React.FC<XIconProps> = ({ className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 1227"
      className={className}
      fill="currentColor"
    >
      <path
        d="M713.6 519.9 1160.5 0H1048.6L666.3 450.8 363.8 0H0L466.1 681.1 0 1226.9H111.9L515 748.7 836.2 1226.9H1200M152.67 79.83H290.86L1048.62 1147.37H910.44"
      />
    </svg>
  );
};

export default XIcon;

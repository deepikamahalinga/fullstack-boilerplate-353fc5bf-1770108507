import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text,
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        {/* Spinner */}
        <div
          className={`
            ${sizeClasses[size]}
            border-4
            border-gray-200
            border-t-blue-500
            rounded-full
            animate-spin
          `}
        />
        
        {/* Gradient overlay for more visual appeal */}
        <div
          className={`
            absolute
            top-0
            left-0
            ${sizeClasses[size]}
            border-4
            border-transparent
            border-t-blue-400/30
            rounded-full
            animate-pulse
          `}
        />
      </div>

      {text && (
        <p
          className={`
            mt-2
            ${textSizeClasses[size]}
            text-gray-600
            font-medium
            animate-pulse
          `}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
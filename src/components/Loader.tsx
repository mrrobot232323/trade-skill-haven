import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'accent' | 'muted';
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'primary',
  text 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    accent: 'border-accent',
    muted: 'border-muted-foreground'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div 
        className={`
          ${sizeClasses[size]} 
          border-4 border-t-transparent 
          ${colorClasses[color]} 
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
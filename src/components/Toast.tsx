import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  onRemove
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 50);

    // Auto remove
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(id), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBackgroundClass = () => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-gradient-to-r from-success/10 to-success/5 backdrop-blur-sm';
      case 'error':
        return 'border-destructive/30 bg-gradient-to-r from-destructive/10 to-destructive/5 backdrop-blur-sm';
      case 'warning':
        return 'border-warning/30 bg-gradient-to-r from-warning/10 to-warning/5 backdrop-blur-sm';
      case 'info':
        return 'border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-700 ease-out
        ${isVisible 
          ? 'translate-x-0 translate-y-0 opacity-100 scale-100 rotate-0' 
          : 'translate-x-full translate-y-4 opacity-0 scale-95 rotate-6'
        }
      `}
    >
      <div className={`
        max-w-md w-full bg-card border-2 rounded-xl shadow-2xl p-5
        ${getBackgroundClass()}
        ${type === 'success' ? 'animate-bounce-once' : ''}
        transition-all duration-300 hover:scale-105 hover:shadow-elegant
      `}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-0.5">
            <div className={`${type === 'success' ? 'animate-scale-in' : ''}`}>
              {getIcon()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground">
              {title}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 hover:bg-muted/50 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onRemove'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id, onRemove: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    success: (title: string, description?: string) => 
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => 
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => 
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => 
      addToast({ type: 'info', title, description }),
  };
};

export default Toast;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { AuthData } from '@/types';
import { useToast } from '@/components/Toast';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleSubmit = async (data: AuthData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (data.email === 'test@example.com' && data.password === 'password') {
        success('Welcome back!', 'You have been successfully logged in.');
        navigate('/dashboard');
      } else {
        // Simulate successful signup/login for demo
        success(
          data.name ? 'Account created!' : 'Welcome back!',
          data.name 
            ? 'Your account has been created successfully.' 
            : 'You have been successfully logged in.'
        );
        navigate('/dashboard');
      }
    } catch (err) {
      error(
        'Authentication failed',
        'Please check your credentials and try again.'
      );
      throw err;
    }
  };

  return <AuthForm onSubmit={handleSubmit} />;
};

export default Auth;
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { AuthData } from '@/types';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { signUp, signIn, user } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (data: AuthData) => {
    try {
      let result;
      
      if (data.name) {
        // Sign up
        result = await signUp(data.email, data.password, data.name);
        if (!result.error) {
          success('Account created!', 'Welcome to SkillSwap! Redirecting to dashboard...');
          // Small delay to show success message before redirect
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        }
      } else {
        // Sign in
        result = await signIn(data.email, data.password);
        if (!result.error) {
          success('Welcome back!', 'You have been successfully logged in.');
          // Immediate redirect on login
          navigate('/dashboard', { replace: true });
        }
      }

      if (result.error) {
        // Handle specific error messages
        const errorMessage = result.error.message;
        if (errorMessage.includes('Invalid login credentials')) {
          error('Login failed', 'Invalid email or password. Please try again.');
        } else if (errorMessage.includes('User already registered')) {
          error('Signup failed', 'An account with this email already exists. Please login instead.');
        } else if (errorMessage.includes('Email not confirmed')) {
          error('Email not confirmed', 'Please check your email to confirm your account.');
        } else {
          error('Authentication failed', errorMessage);
        }
        throw result.error;
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return <AuthForm onSubmit={handleSubmit} />;
};

export default Auth;
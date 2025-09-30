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
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (data: AuthData) => {
    try {
      let result;
      
      if (data.name) {
        // Sign up
        result = await signUp(data.email, data.password, data.name);
        if (!result.error) {
          success('Account created!', 'Welcome to SkillSwap! You can now log in.');
        }
      } else {
        // Sign in
        result = await signIn(data.email, data.password);
        if (!result.error) {
          success('Welcome back!', 'You have been successfully logged in.');
          navigate('/dashboard');
        }
      }

      if (result.error) {
        error('Authentication failed', result.error.message);
        throw result.error;
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  return <AuthForm onSubmit={handleSubmit} />;
};

export default Auth;
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button, Input, Label } from '../components/ui/Components';
import toast from 'react-hot-toast';
import { CheckSquare } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Logged in successfully');
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors[0].msg);
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div className="auth-icon-wrapper">
            <CheckSquare className="text-primary" size={24} />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.5rem' }}>Sign in to your account to continue</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground" style={{ marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-primary" style={{ textDecoration: 'none' }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

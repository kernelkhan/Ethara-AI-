import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Button, Input, Label } from '../components/ui/Components';
import toast from 'react-hot-toast';
import { CheckSquare } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully');
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors[0].msg);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
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
          <h2 className="text-3xl font-bold text-foreground">Create an account</h2>
          <p className="text-sm text-muted-foreground" style={{ marginTop: '0.5rem' }}>Get started with TaskMaster</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
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
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="Member" style={{ background: 'var(--background)' }}>Member</option>
                <option value="Admin" style={{ background: 'var(--background)' }}>Admin</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full">Sign up</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground" style={{ marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary" style={{ textDecoration: 'none' }} onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} onMouseOut={e=>e.currentTarget.style.textDecoration='none'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

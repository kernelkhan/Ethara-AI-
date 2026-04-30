import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Button, Input, Label } from '../components/ui/Components';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
      toast.success(data.message);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card animate-slide-in">
        <div className="auth-icon-wrapper">
          <Lock size={28} className="text-primary" />
        </div>
        
        <h2 className="text-3xl font-bold" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Reset Password</h2>
        
        {!success ? (
          <>
            <p className="text-muted-foreground" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Please enter your new password below.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="stagger-1">
                <Label htmlFor="password">New Password</Label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '0.8rem', color: 'var(--muted-foreground)' }} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    style={{ paddingLeft: '2.75rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="stagger-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '0.8rem', color: 'var(--muted-foreground)' }} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    style={{ paddingLeft: '2.75rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="stagger-3" style={{ marginTop: '0.5rem' }}>
                <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="stagger-1" style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={48} className="text-primary" style={{ margin: '0 auto 1rem auto' }} />
            <h3 className="text-xl font-bold" style={{ marginBottom: '0.5rem' }}>Success!</h3>
            <p className="text-muted-foreground" style={{ marginBottom: '1.5rem' }}>
              Your password has been reset successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

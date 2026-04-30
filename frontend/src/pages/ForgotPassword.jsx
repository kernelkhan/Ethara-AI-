import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Button, Input, Label } from '../components/ui/Components';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgotpassword', { email });
      setSubmitted(true);
      toast.success(data.message);
      if (data.previewUrl) {
        console.log("Email Preview URL:", data.previewUrl); // So the user can see it in console during dev
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card animate-slide-in">
        <div className="auth-icon-wrapper">
          <KeyRound size={28} className="text-primary" />
        </div>
        
        <h2 className="text-3xl font-bold" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Forgot Password</h2>
        
        {!submitted ? (
          <>
            <p className="text-muted-foreground" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="stagger-1">
                <Label htmlFor="email">Email</Label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '0.8rem', color: 'var(--muted-foreground)' }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    style={{ paddingLeft: '2.75rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="stagger-2" style={{ marginTop: '0.5rem' }}>
                <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="stagger-1" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ marginBottom: '1.5rem', fontWeight: 500, color: 'var(--primary)' }}>
              If an account exists for {email}, you will receive a password reset link shortly.
            </p>
            <p className="text-sm text-muted-foreground" style={{ marginBottom: '1rem' }}>
              (Check the terminal or browser console for the Ethereal email URL during development)
            </p>
          </div>
        )}

        <div className="stagger-3" style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try { setError(''); const res = await registerApi(data); loginUser(res.data.token, res.data.customer); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || err.response?.data?.details?.[0] || 'Registration failed.'); }
  };

  const F = ({ label, name, type='text', placeholder, rules, hint }) => (
    <div>
      <label style={{ display:'block', fontSize:12, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>{label}</label>
      <input type={type} className="input-field" placeholder={placeholder} {...register(name, rules)}/>
      {errors[name] && <p style={{ color:'var(--red)', fontSize:12, marginTop:6 }}>{errors[name].message}</p>}
      {hint && !errors[name] && <p style={{ color:'var(--text-muted)', fontSize:11, marginTop:5 }}>{hint}</p>}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:32, position:'relative', zIndex:1 }}>
      <div className="animate-fade-up" style={{ width:'100%', maxWidth:520 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:52, height:52, background:'linear-gradient(135deg,#F5B938,#E8A020)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, color:'#0a0e1a', boxShadow:'0 8px 24px rgba(245,185,56,0.35)', margin:'0 auto 16px' }}>₦</div>
          <h1 className="font-display" style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.02em', marginBottom:6 }}>Create your account</h1>
          <p style={{ fontSize:14, color:'var(--text-secondary)' }}>Join thousands accessing smart credit</p>
        </div>
        <div className="card" style={{ padding:32 }}>
          {error && <div className="alert-error" style={{ marginBottom:20 }}>⚠ {error}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <F label="First Name" name="first_name" placeholder="Abdulbaki" rules={{ required:'Required' }}/>
              <F label="Last Name" name="last_name" placeholder="Salawu" rules={{ required:'Required' }}/>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <F label="Email Address" name="email" type="email" placeholder="you@example.com" rules={{ required:'Email is required' }}/>
              <F label="Phone Number" name="phone" placeholder="08012345678" rules={{ required:'Phone is required', pattern:{ value:/^[0-9]{11}$/, message:'Must be exactly 11 digits' } }} hint="Nigerian format — 11 digits"/>
              <F label="Password" name="password" type="password" placeholder="Min 8 characters" rules={{ required:'Password is required', minLength:{ value:8, message:'Minimum 8 characters' } }}/>
              <F label="BVN (optional)" name="bvn" placeholder="11-digit BVN" rules={{ pattern:{ value:/^[0-9]{11}$/, message:'BVN must be exactly 11 digits' } }} hint="Optional — improves your credit limit"/>
            </div>
            <button type="submit" className="btn-gold" disabled={isSubmitting} style={{ width:'100%', marginTop:24 }}>
              {isSubmitting ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)', marginTop:20 }}>
            Already have an account?{' '}<Link to="/login" style={{ color:'var(--gold)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

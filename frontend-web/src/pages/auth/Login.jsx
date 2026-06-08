import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try { setError(''); const res = await login(data); loginUser(res.data.token, res.data.customer); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Login failed.'); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg-deep)', position:'relative', zIndex:1 }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:64, position:'relative', background:'linear-gradient(135deg,var(--bg-surface) 0%,var(--bg-deep) 100%)', borderRight:'1px solid var(--border)' }}>
        <div style={{ position:'absolute', top:'20%', right:'-120px', width:300, height:300, borderRadius:'50%', border:'1px solid rgba(245,185,56,0.08)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'25%', right:'-80px', width:200, height:200, borderRadius:'50%', border:'1px solid rgba(245,185,56,0.12)', pointerEvents:'none' }}/>
        <div className="animate-fade-up" style={{ maxWidth:480, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:64 }}>
            <div style={{ width:44, height:44, background:'linear-gradient(135deg,#F5B938,#E8A020)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#0a0e1a', boxShadow:'0 8px 24px rgba(245,185,56,0.35)' }}>₦</div>
            <span className="font-display" style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em' }}>LoanFlow</span>
          </div>
          <h1 className="font-display" style={{ fontSize:44, fontWeight:800, lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:16 }}>
            Smart lending<br/><span className="text-gold-gradient">for modern life.</span>
          </h1>
          <p style={{ fontSize:16, color:'var(--text-secondary)', lineHeight:1.7, maxWidth:380 }}>Access credit instantly, manage repayments, and build your financial profile.</p>
          <div style={{ display:'flex', gap:32, marginTop:48 }}>
            {[{value:'₦10M+',label:'Max loan amount'},{value:'18%',label:'Starting rate p.a.'},{value:'60mo',label:'Max tenure'}].map(({value,label})=>(
              <div key={label}><div className="font-display text-gold" style={{ fontSize:22, fontWeight:700 }}>{value}</div><div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{label}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width:460, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 40px' }}>
        <div className="animate-fade-up-1" style={{ width:'100%', maxWidth:380 }}>
          <h2 className="font-display" style={{ fontSize:26, fontWeight:700, marginBottom:6, letterSpacing:'-0.02em' }}>Welcome back</h2>
          <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:32 }}>Sign in to continue to your dashboard</p>
          {error && <div className="alert-error" style={{ marginBottom:20 }}>⚠ {error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com" {...register('email',{required:'Email is required'})}/>
              {errors.email && <p style={{ color:'var(--red)', fontSize:12, marginTop:6 }}>{errors.email.message}</p>}
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>Password</label>
              <input type="password" className="input-field" placeholder="••••••••" {...register('password',{required:'Password is required'})}/>
              {errors.password && <p style={{ color:'var(--red)', fontSize:12, marginTop:6 }}>{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn-gold" disabled={isSubmitting} style={{ marginTop:8, width:'100%' }}>
              {isSubmitting ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div style={{ textAlign:'center', marginTop:28 }}>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>Don't have an account?{' '}
              <Link to="/register" style={{ color:'var(--gold)', fontWeight:600, textDecoration:'none' }}>Create one</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

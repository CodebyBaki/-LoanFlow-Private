import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to:'/dashboard',   label:'Dashboard', icon:'⬡' },
  { to:'/loans',       label:'My Loans',  icon:'◈' },
  { to:'/loans/apply', label:'Apply',     icon:'✦' },
  { to:'/payments',    label:'Payments',  icon:'◎' },
  { to:'/credit',      label:'Credit',    icon:'◇' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user ? `${user.first_name?.[0]||''}${user.last_name?.[0]||''}`.toUpperCase() : '??';

  return (
    <div style={{ display:'flex', minHeight:'100vh', position:'relative', zIndex:1 }}>
      <aside style={{ width:240, flexShrink:0, background:'var(--bg-surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:'24px 16px', position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'0 8px 28px', borderBottom:'1px solid var(--border)', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#F5B938,#E8A020)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#0a0e1a', boxShadow:'0 4px 12px rgba(245,185,56,0.3)' }}>₦</div>
            <div>
              <div className="font-display" style={{ fontSize:17, fontWeight:800, letterSpacing:'-0.02em' }}>LoanFlow</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Finance Platform</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', padding:'0 8px', marginBottom:8 }}>Menu</div>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to==='/dashboard'} className={({ isActive }) => `nav-link ${isActive?'active':''}`}>
              <span style={{ fontSize:16, width:20, textAlign:'center' }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:16, marginTop:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--gold-dim),var(--cyan-dim))', border:'1px solid var(--border-glow)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'var(--gold)', flexShrink:0 }}>{initials}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:16, padding:4, borderRadius:6, transition:'color 0.2s', flexShrink:0 }}
              onMouseEnter={e=>e.target.style.color='#F87171'} onMouseLeave={e=>e.target.style.color='var(--text-muted)'}>⏻</button>
          </div>
        </div>
      </aside>
      <main style={{ flex:1, overflow:'auto', padding:'32px 36px', position:'relative', zIndex:1 }}>{children}</main>
    </div>
  );
}

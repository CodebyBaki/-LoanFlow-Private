import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Layout from '../../components/layout/Layout';

export default function AdminCustomers() {
  const { data, isLoading } = useQuery({ queryKey:['admin-customers'], queryFn:()=>client.get('/customers?limit=50') });
  const customers = data?.data?.customers || [];

  return (
    <Layout>
      <div style={{marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <h1 className="font-display" style={{fontSize:28,fontWeight:800,letterSpacing:'-0.02em',color:'var(--text-primary)'}}>Admin — Customers</h1>
          <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:4}}>All registered customers ({customers.length})</p>
        </div>
        <Link to="/admin/loans" style={{textDecoration:'none'}}><button className="btn-gold" style={{fontSize:13}}>📋 Manage Loans</button></Link>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {isLoading ? <div style={{padding:24}}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:52,marginBottom:8,borderRadius:8}}/>)}</div>
        : <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Verified</th><th>Joined</th></tr></thead>
            <tbody>
              {customers.map(c=>(
                <tr key={c.id}>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{c.first_name} {c.last_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td><span className={c.role==='admin'?'badge badge-approved':'badge badge-active'}>{c.role}</span></td>
                  <td style={{color:c.is_verified?'#2DD4BF':'#F87171'}}>{c.is_verified?'✓':'✕'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString('en-NG')}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </Layout>
  );
}

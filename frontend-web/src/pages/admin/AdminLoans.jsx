import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Layout from '../../components/layout/Layout';

const fmt = (n) => `₦${Number(n||0).toLocaleString('en-NG')}`;
const BADGE = { pending:'badge badge-pending', under_review:'badge badge-under_review', approved:'badge badge-approved', rejected:'badge badge-rejected', disbursed:'badge badge-disbursed', active:'badge badge-active', completed:'badge badge-completed' };

export default function AdminLoans() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [rate, setRate] = useState('18');
  const [disbForm, setDisbForm] = useState({ account_number:'0123456789', bank_code:'044', bank_name:'Access Bank' });
  const [msg, setMsg] = useState('');

  const { data, isLoading } = useQuery({ queryKey:['admin-loans',filter], queryFn:()=>client.get(`/loans${filter?`?status=${filter}`:''}`) });
  const loans = data?.data?.loans || [];

  const reviewMutation = useMutation({
    mutationFn: ({id,body}) => client.patch(`/loans/${id}/review`, body),
    onSuccess: (_,{body}) => { setMsg(`Loan ${body.status} successfully ✓`); setSelected(null); setAction(''); qc.invalidateQueries(['admin-loans']); },
    onError: (err) => setMsg(err.response?.data?.error || 'Action failed'),
  });

  const disburseMutation = useMutation({
    mutationFn: (body) => client.post('/disbursements', body),
    onSuccess: () => { setMsg('Disbursement successful — funds sent! ✓'); setSelected(null); setAction(''); qc.invalidateQueries(['admin-loans']); },
    onError: (err) => setMsg(err.response?.data?.error || 'Disbursement failed'),
  });

  return (
    <Layout>
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h1 className="font-display" style={{fontSize:28,fontWeight:800,letterSpacing:'-0.02em',color:'var(--text-primary)'}}>Admin — Loan Management</h1>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginTop:4}}>Review, approve, reject and disburse loans</p>
          </div>
          <Link to="/admin/customers" style={{textDecoration:'none'}}><button className="btn-ghost" style={{fontSize:13}}>👥 Customers</button></Link>
        </div>
        {msg && <div className={msg.includes('✓')?'alert-success':'alert-error'} style={{marginTop:16,display:'flex',justifyContent:'space-between'}}>
          {msg}<button onClick={()=>setMsg('')} style={{background:'none',border:'none',cursor:'pointer',color:'inherit',fontSize:18}}>×</button>
        </div>}
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
        {['pending','under_review','approved','disbursed','active','completed','rejected',''].map(f=>(
          <button key={f||'all'} onClick={()=>setFilter(f)} style={{padding:'6px 14px',borderRadius:100,fontSize:12,fontWeight:600,cursor:'pointer',border:'1px solid',background:filter===f?'var(--gold-dim)':'transparent',borderColor:filter===f?'var(--gold)':'var(--border)',color:filter===f?'var(--gold)':'var(--text-muted)',textTransform:'capitalize',transition:'all 0.15s'}}>
            {f||'All'}
          </button>
        ))}
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {isLoading ? <div style={{padding:24}}>{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:56,marginBottom:8,borderRadius:8}}/>)}</div>
        : loans.length===0 ? <div style={{textAlign:'center',padding:'48px 32px',color:'var(--text-muted)'}}>No {filter||''}  loans found</div>
        : <table className="data-table">
            <thead><tr><th>Customer</th><th>Amount</th><th>Tenure</th><th>Purpose</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loans.map(loan=>(
                <tr key={loan.id}>
                  <td style={{fontFamily:'monospace',fontSize:11}}>{loan.customer_id?.slice(0,8)}…</td>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{fmt(loan.amount)}</td>
                  <td>{loan.tenure_months}mo</td>
                  <td style={{maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{loan.purpose}</td>
                  <td><span className={BADGE[loan.status]||'badge badge-pending'}>{loan.status.replace('_',' ')}</span></td>
                  <td>{new Date(loan.applied_at).toLocaleDateString('en-NG')}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      {['pending','under_review'].includes(loan.status)&&<>
                        <button onClick={()=>{setSelected(loan);setAction('approved');setMsg('');}} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #2DD4BF',background:'rgba(45,212,191,0.1)',color:'#2DD4BF',cursor:'pointer',fontSize:11,fontWeight:600}}>Approve</button>
                        <button onClick={()=>{setSelected(loan);setAction('rejected');setMsg('');}} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #F87171',background:'rgba(248,113,113,0.1)',color:'#F87171',cursor:'pointer',fontSize:11,fontWeight:600}}>Reject</button>
                      </>}
                      {loan.status==='approved'&&<button onClick={()=>{setSelected(loan);setAction('disburse');setMsg('');}} style={{padding:'4px 10px',borderRadius:6,border:'1px solid var(--gold)',background:'var(--gold-dim)',color:'var(--gold)',cursor:'pointer',fontSize:11,fontWeight:600}}>Disburse</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>

      {selected&&action&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setSelected(null);setAction('');}}>
          <div className="card" style={{width:480,padding:32,zIndex:1001}} onClick={e=>e.stopPropagation()}>
            {action==='approved'&&<>
              <h2 className="font-display" style={{fontSize:20,fontWeight:700,marginBottom:4,color:'var(--text-primary)'}}>Approve Loan</h2>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:20}}>{fmt(selected.amount)} · {selected.tenure_months} months</p>
              <label style={{display:'block',fontSize:12,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:8}}>Interest Rate (% p.a.)</label>
              <input type="number" className="input-field" value={rate} onChange={e=>setRate(e.target.value)} style={{marginBottom:20}}/>
              <div style={{display:'flex',gap:10}}>
                <button className="btn-gold" style={{flex:1}} onClick={()=>reviewMutation.mutate({id:selected.id,body:{status:'approved',interest_rate:parseFloat(rate)}})} disabled={reviewMutation.isPending}>{reviewMutation.isPending?'Approving...':'✓ Confirm Approval'}</button>
                <button className="btn-ghost" onClick={()=>{setSelected(null);setAction('');}}>Cancel</button>
              </div>
            </>}
            {action==='rejected'&&<>
              <h2 className="font-display" style={{fontSize:20,fontWeight:700,marginBottom:4,color:'var(--text-primary)'}}>Reject Loan</h2>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:20}}>{fmt(selected.amount)} · {selected.tenure_months} months</p>
              <label style={{display:'block',fontSize:12,fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:8}}>Rejection Reason</label>
              <textarea className="input-field" rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain why..." style={{marginBottom:20}}/>
              <div style={{display:'flex',gap:10}}>
                <button style={{flex:1,padding:'12px 24px',borderRadius:10,border:'1px solid #F87171',background:'rgba(248,113,113,0.1)',color:'#F87171',cursor:'pointer',fontWeight:700,fontSize:14}} onClick={()=>reviewMutation.mutate({id:selected.id,body:{status:'rejected',rejection_reason:reason}})} disabled={reviewMutation.isPending}>{reviewMutation.isPending?'Rejecting...':'✕ Confirm Rejection'}</button>
                <button className="btn-ghost" onClick={()=>{setSelected(null);setAction('');}}>Cancel</button>
              </div>
            </>}
            {action==='disburse'&&<>
              <h2 className="font-display" style={{fontSize:20,fontWeight:700,marginBottom:4,color:'var(--text-primary)'}}>Disburse Funds</h2>
              <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:16}}>Send {fmt(selected.amount)} to customer account</p>
              <div style={{background:'var(--bg-elevated)',borderRadius:10,padding:16,marginBottom:16}}>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8,fontWeight:600}}>SELECT TEST ACCOUNT</div>
                {[['0123456789','044','Access Bank'],['9876543210','058','GTBank'],['1111111111','011','First Bank'],['2222222222','033','UBA']].map(([acc,code,bank])=>(
                  <button key={acc} onClick={()=>setDisbForm({account_number:acc,bank_code:code,bank_name:bank})} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:8,marginBottom:4,cursor:'pointer',border:`1px solid ${disbForm.account_number===acc?'var(--gold)':'var(--border)'}`,background:disbForm.account_number===acc?'var(--gold-dim)':'transparent',color:disbForm.account_number===acc?'var(--gold)':'var(--text-secondary)',fontSize:12,fontWeight:600}}>
                    {acc} — {bank}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn-gold" style={{flex:1}} onClick={()=>disburseMutation.mutate({loan_id:selected.id,customer_id:selected.customer_id,amount:selected.amount,...disbForm})} disabled={disburseMutation.isPending||!disbForm.account_number}>{disburseMutation.isPending?'Processing...':'₦ Send Funds'}</button>
                <button className="btn-ghost" onClick={()=>{setSelected(null);setAction('');}}>Cancel</button>
              </div>
            </>}
          </div>
        </div>
      )}
    </Layout>
  );
}

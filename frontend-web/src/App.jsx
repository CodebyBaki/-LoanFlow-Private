import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import Dashboard      from './pages/dashboard/Dashboard';
import Loans          from './pages/loans/Loans';
import ApplyLoan      from './pages/loans/ApplyLoan';
import Payments       from './pages/payments/Payments';
import CreditScore    from './pages/loans/CreditScore';
import AdminLoans     from './pages/admin/AdminLoans';
import AdminCustomers from './pages/admin/AdminCustomers';

const Spinner = () => (
  <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-deep)'}}>
    <div style={{width:40,height:40,borderRadius:'50%',border:'3px solid var(--border)',borderTopColor:'var(--gold)',animation:'spin 0.8s linear infinite'}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const Protected = ({children}) => { const {user,loading}=useAuth(); if(loading)return<Spinner/>; return user?children:<Navigate to="/login" replace/>; };
const AdminOnly = ({children}) => { const {user,loading,hasRole}=useAuth(); if(loading)return<Spinner/>; if(!user)return<Navigate to="/login" replace/>; if(!hasRole('admin'))return<Navigate to="/dashboard" replace/>; return children; };
const Public = ({children}) => { const {user,loading}=useAuth(); if(loading)return<Spinner/>; return user?<Navigate to="/dashboard" replace/>:children; };

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                element={<Navigate to="/dashboard" replace/>}/>
      <Route path="/login"           element={<Public><Login/></Public>}/>
      <Route path="/register"        element={<Public><Register/></Public>}/>
      <Route path="/dashboard"       element={<Protected><Dashboard/></Protected>}/>
      <Route path="/loans"           element={<Protected><Loans/></Protected>}/>
      <Route path="/loans/apply"     element={<Protected><ApplyLoan/></Protected>}/>
      <Route path="/payments"        element={<Protected><Payments/></Protected>}/>
      <Route path="/credit"          element={<Protected><CreditScore/></Protected>}/>
      <Route path="/admin/loans"     element={<AdminOnly><AdminLoans/></AdminOnly>}/>
      <Route path="/admin/customers" element={<AdminOnly><AdminCustomers/></AdminOnly>}/>
      <Route path="*"                element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  );
}

export default function App() { return <AuthProvider><AppRoutes/></AuthProvider>; }

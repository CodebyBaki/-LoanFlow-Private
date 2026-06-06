import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyLoans } from '../../api/loans';
import { getMyScore } from '../../api/credit';
import { getMyPayments } from '../../api/payments';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import Spinner from '../../components/common/Spinner';

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-700',
  approved:    'bg-green-100 text-green-700',
  active:      'bg-blue-100 text-blue-700',
  rejected:    'bg-red-100 text-red-700',
  disbursed:   'bg-purple-100 text-purple-700',
  completed:   'bg-gray-100 text-gray-700',
};

export default function Dashboard() {
  const { user } = useAuth();

  const { data: loansData,    isLoading: loansLoading    } = useQuery({ queryKey: ['my-loans'],    queryFn: () => getMyLoans({ limit: 5 }) });
  const { data: scoreData,    isLoading: scoreLoading    } = useQuery({ queryKey: ['credit-score'], queryFn: getMyScore, retry: false });
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({ queryKey: ['my-payments'], queryFn: () => getMyPayments({ limit: 5 }) });

  const loans    = loansData?.data?.loans    || [];
  const score    = scoreData?.data?.credit_score;
  const payments = paymentsData?.data?.payments || [];

  const activeLoans = loans.filter((l) => ['active', 'disbursed'].includes(l.status));
  const totalOwed   = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your financial overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Loans"    value={activeLoans.length}        icon="📋" color="blue"   />
        <StatCard title="Total Borrowed"  value={formatNaira(totalOwed)}    icon="💰" color="green"  />
        <StatCard title="Credit Score"    value={score?.score || '—'}       icon="⭐" color="yellow" subtitle={score?.rating || 'Apply for a loan'} />
        <StatCard title="Total Payments"  value={payments.length}           icon="✅" color="green"  />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Loans */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Recent Loans</h2>
            <Link to="/loans" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {loansLoading ? <Spinner /> : loans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No loans yet</p>
              <Link to="/loans/apply" className="btn-primary text-sm">Apply for a Loan</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {loans.slice(0, 5).map((loan) => (
                <div key={loan.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{formatNaira(loan.amount)}</p>
                    <p className="text-xs text-gray-500">{loan.tenure_months} months • {loan.purpose?.slice(0, 30)}...</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[loan.status] || 'bg-gray-100 text-gray-700'}`}>
                    {loan.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Recent Payments</h2>
            <Link to="/payments" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {paymentsLoading ? <Spinner /> : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{formatNaira(payment.amount)}</p>
                    <p className="text-xs text-gray-500">{payment.reference}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

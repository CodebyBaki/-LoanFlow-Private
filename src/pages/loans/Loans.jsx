import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyLoans } from '../../api/loans';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-700',
  approved:    'bg-green-100 text-green-700',
  active:      'bg-blue-100 text-blue-700',
  rejected:    'bg-red-100 text-red-700',
  disbursed:   'bg-purple-100 text-purple-700',
  completed:   'bg-gray-100 text-gray-700',
  under_review:'bg-orange-100 text-orange-700',
};

export default function Loans() {
  const { data, isLoading } = useQuery({ queryKey: ['my-loans-all'], queryFn: () => getMyLoans({ limit: 50 }) });
  const loans = data?.data?.loans || [];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-500 mt-1">Track all your loan applications</p>
        </div>
        <Link to="/loans/apply" className="btn-primary">+ Apply for Loan</Link>
      </div>

      {isLoading ? <Spinner size="lg" /> : loans.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-500 mb-6">You haven't applied for any loans yet</p>
          <Link to="/loans/apply" className="btn-primary">Apply for your first loan</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{formatNaira(loan.amount)}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[loan.status] || 'bg-gray-100 text-gray-700'}`}>
                      {loan.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{loan.purpose}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>📅 {loan.tenure_months} months</span>
                    <span>💹 {loan.interest_rate}% p.a.</span>
                    <span>📆 Applied: {new Date(loan.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Monthly repayment</p>
                  <p className="font-bold text-primary-600">{formatNaira(loan.monthly_repayment)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

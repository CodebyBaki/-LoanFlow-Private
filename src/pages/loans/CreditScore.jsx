import { useQuery } from '@tanstack/react-query';
import { getMyScore } from '../../api/credit';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';

const RATING_COLORS = {
  excellent: { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50'  },
  very_good: { bar: 'bg-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50'   },
  good:      { bar: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  fair:      { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  poor:      { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
};

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function CreditScore() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['credit-score'], queryFn: getMyScore, retry: false });
  const score = data?.data?.credit_score;
  const colors = score ? RATING_COLORS[score.rating] || RATING_COLORS.poor : null;
  const pct = score ? ((score.score - 300) / 550) * 100 : 0;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Credit Score</h1>
          <p className="text-gray-500 mt-1">Your creditworthiness rating</p>
        </div>

        {isLoading ? <Spinner size="lg" /> : isError || !score ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-4">⭐</p>
            <p className="text-gray-500 mb-2 font-medium">No credit score yet</p>
            <p className="text-gray-400 text-sm">Apply for a loan to generate your credit profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`card ${colors.bg} border-0`}>
              <div className="text-center">
                <p className="text-6xl font-bold text-gray-900 mb-2">{score.score}</p>
                <p className={`text-lg font-semibold capitalize ${colors.text}`}>{score.rating.replace('_', ' ')}</p>
                <p className="text-gray-500 text-sm mt-1">Score range: 300 – 850</p>
              </div>
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`${colors.bar} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>300 (Poor)</span><span>850 (Excellent)</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Loan Eligibility</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Max Loan Amount</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatNaira(score.max_loan_amount)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Interest Rate</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{score.interest_rate}% p.a.</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Last updated: {new Date(score.last_updated).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

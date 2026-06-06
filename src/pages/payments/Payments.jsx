import { useQuery } from '@tanstack/react-query';
import { getMyPayments } from '../../api/payments';
import Layout from '../../components/layout/Layout';
import Spinner from '../../components/common/Spinner';

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function Payments() {
  const { data, isLoading } = useQuery({ queryKey: ['my-payments-all'], queryFn: () => getMyPayments({ limit: 50 }) });
  const payments = data?.data?.payments || [];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
        <p className="text-gray-500 mt-1">Your repayment history</p>
      </div>

      {isLoading ? <Spinner size="lg" /> : payments.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">💳</p>
          <p className="text-gray-500">No payments recorded yet</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Reference','Amount','Channel','Status','Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{p.reference}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatNaira(p.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{p.channel}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

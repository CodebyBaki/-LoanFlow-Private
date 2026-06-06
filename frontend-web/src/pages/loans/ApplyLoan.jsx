import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { applyForLoan, calculateLoan } from '../../api/loans';
import Layout from '../../components/layout/Layout';
import Alert from '../../components/common/Alert';

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString()}`;

export default function ApplyLoan() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [preview,   setPreview]   = useState(null);
  const navigate = useNavigate();

  const amount        = watch('amount');
  const tenure_months = watch('tenure_months');

  const handlePreview = async () => {
    if (!amount || !tenure_months) return;
    try {
      const res = await calculateLoan({ amount, interest_rate: 18, tenure_months });
      setPreview(res.data);
    } catch {}
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      await applyForLoan(data);
      setSuccess('Loan application submitted successfully! We will review it shortly.');
      setTimeout(() => navigate('/loans'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Application failed. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Apply for a Loan</h1>
          <p className="text-gray-500 mt-1">Fill in the details below to submit your application</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Alert type="error"   message={error}   />
            <Alert type="success" message={success} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₦)</label>
              <input type="number" className="input-field" placeholder="500000"
                {...register('amount', { required: 'Amount is required', min: { value: 10000, message: 'Minimum ₦10,000' }, max: { value: 10000000, message: 'Maximum ₦10,000,000' } })}
                onBlur={handlePreview}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (months)</label>
              <select className="input-field" {...register('tenure_months', { required: 'Tenure is required' })} onBlur={handlePreview}>
                <option value="">Select tenure</option>
                {[3,6,9,12,18,24,36,48,60].map((m) => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
              {errors.tenure_months && <p className="text-red-500 text-xs mt-1">{errors.tenure_months.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <textarea rows={3} className="input-field" placeholder="Describe what the loan is for..."
                {...register('purpose', { required: 'Purpose is required', minLength: { value: 5, message: 'Min 5 characters' } })}
              />
              {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>}
            </div>

            {preview && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">📊 Loan Preview (at 18% p.a.)</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <span>Monthly repayment:</span><span className="font-bold">{formatNaira(preview.monthly_repayment)}</span>
                  <span>Total repayment:</span>  <span className="font-bold">{formatNaira(preview.total_repayment)}</span>
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

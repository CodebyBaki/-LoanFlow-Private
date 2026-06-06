import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <span className="font-bold text-xl text-primary-700">LoanFlow</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/dashboard"  className="text-sm text-gray-600 hover:text-primary-600">Dashboard</Link>
          <Link to="/loans"      className="text-sm text-gray-600 hover:text-primary-600">Loans</Link>
          <Link to="/payments"   className="text-sm text-gray-600 hover:text-primary-600">Payments</Link>
          <Link to="/credit"     className="text-sm text-gray-600 hover:text-primary-600">Credit Score</Link>
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
            <span className="text-sm text-gray-700 font-medium">
              {user?.first_name} {user?.last_name}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

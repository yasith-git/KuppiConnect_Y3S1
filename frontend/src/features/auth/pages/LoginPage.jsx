import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dummyUsers } from '../../../data/dummyData';

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    const user = dummyUsers.find(
      (u) => u.email === form.email && u.password === form.password
    );
    if (!user) {
      setError('Invalid email or password.');
      return;
    }
    localStorage.setItem('kuppi_user', JSON.stringify({ name: user.name, email: user.email, role: user.role }));
    navigate(user.role === 'conductor' ? '/conductor' : '/student');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2 text-center">KuppiConnect</h1>
        <p className="text-center text-gray-500 mb-8 text-sm">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-medium hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-6 bg-gray-50 rounded-lg p-3 text-xs text-gray-400">
          <p className="font-medium mb-1">Demo credentials:</p>
          <p>Student: alice@student.com / student123</p>
          <p>Conductor: kamal@conductor.com / conductor123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

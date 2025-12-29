import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { register } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await register({ name, email, password });
      auth.setAuthToken(data.token);
      auth.setUser(data.user);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Registration failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-2xl font-bold">Register</h2>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            type="text"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
          />

          {error ? <div className="text-sm text-red-700">{error}</div> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gray-900 px-3 py-2 text-white disabled:opacity-60"
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-3 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
}

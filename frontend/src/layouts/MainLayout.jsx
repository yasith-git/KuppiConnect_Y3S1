import { Outlet, Link, useNavigate } from 'react-router-dom';

function MainLayout() {
  const navigate = useNavigate();
  const stored = localStorage.getItem('kuppi_user');
  const user = stored ? JSON.parse(stored) : null;
  const isStudent = user?.role === 'student';

  function handleLogout() {
    localStorage.removeItem('kuppi_user');
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-indigo-700 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wide">
            KuppiConnect
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            {isStudent ? (
              <>
                <Link to="/student" className="hover:text-indigo-200 transition">Home</Link>
                <Link to="/student/register" className="hover:text-indigo-200 transition">Classes</Link>
                <Link to="/student/content" className="hover:text-indigo-200 transition">Content</Link>
                <Link to="/student/reviews" className="hover:text-indigo-200 transition">Reviews</Link>
              </>
            ) : (
              <>
                <Link to="/conductor" className="hover:text-indigo-200 transition">Dashboard</Link>
                <Link to="/conductor/classes" className="hover:text-indigo-200 transition">Classes</Link>
                <Link to="/conductor/content" className="hover:text-indigo-200 transition">Content</Link>
                <Link to="/conductor/reviews" className="hover:text-indigo-200 transition">Reviews</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-80">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-700 px-3 py-1 rounded font-semibold hover:bg-indigo-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        © 2026 KuppiConnect. All rights reserved.
      </footer>
    </div>
  );
}

export default MainLayout;

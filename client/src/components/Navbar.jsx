import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiCalendar, HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const auth = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md shadow-sm transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900">Event<span className="text-indigo-600">Hub</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-indigo-600 ${isActive('/') ? 'text-indigo-600' : 'text-gray-600'}`}
            >
              Home
            </Link>

            {auth?.isAuthenticated ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                      {auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {auth.user?.name || 'User'}
                    </span>
                    <HiChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="truncate text-sm font-medium text-gray-900">{auth.user?.email}</p>
                      </div>
                      <Link
                        to="/me"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Dashboard
                      </Link>
                      <Link
                        to="/my-events"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Events
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          auth.logout();
                        }}
                        className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-label="Main menu"
            >
              {isOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="space-y-1 px-2 pt-2 pb-3">
            <Link
              to="/"
              className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Dashboard
            </Link>
            {auth?.isAuthenticated ? (
              <>
                <Link
                  to="/my-events"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/my-events') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  My Events
                </Link>
                <Link
                  to="/me"
                  className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/me') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  My Dashboard
                </Link>
                <div className="mt-4 border-t border-gray-100 pt-4 px-3">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                        {auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-gray-800">{auth.user?.name || 'User'}</div>
                      <div className="text-sm font-medium leading-none text-gray-500 mt-1">{auth.user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => auth.logout()}
                    className="block w-full rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 text-left"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 border-t border-gray-100 pt-4 px-2 space-y-2">
                <Link
                  to="/login"
                  className="block w-full rounded-md px-3 py-2 text-center text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  Log into your account
                </Link>
                <Link
                  to="/register"
                  className="block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

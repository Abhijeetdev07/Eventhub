import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-gray-300 bg-gray-700">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Left Side: Logo and Description */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <span className="text-xl font-bold tracking-tight text-white">
                                Event<span className="text-indigo-400">Hub</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-300 max-w-md">
                            Discover and manage amazing events. Connect with your community and create memorable experiences.
                        </p>
                        <p className="mt-4 text-xs text-gray-400">
                            © {new Date().getFullYear()} EventHub. All rights reserved.
                        </p>
                    </div>

                    {/* Middle: Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
                        <nav className="flex flex-col gap-2">
                            <Link to="/" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
                                Browse Events
                            </Link>
                            <Link to="/events/new" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
                                Create Event
                            </Link>
                            <Link to="/me" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
                                My Dashboard
                            </Link>
                        </nav>
                    </div>

                    {/* Right: Account Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
                        <nav className="flex flex-col gap-2">
                            <Link to="/login" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="text-sm text-gray-300 hover:text-indigo-400 transition-colors">
                                Sign Up
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>
        </footer>
    );
}

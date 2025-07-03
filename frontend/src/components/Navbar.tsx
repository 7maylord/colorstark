'use client';

import Link from 'next/link';
import WalletConnector from './WalletConnector';

const Logo = () => (
  <Link href="/" className="flex items-center space-x-3 group">
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-r from-starknet-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 group-hover:scale-105">
        <span className="text-white font-bold text-xl">C</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
    </div>
    <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
      ColorStark
    </span>
  </Link>
);

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className = '' }: NavbarProps) => {
  return (
    <div className={`
      relative backdrop-blur-xl bg-gradient-to-r from-purple-900/10 via-black/5 to-blue-900/10 
      border-b border-purple-500/20 shadow-2xl shadow-purple-500/20 ${className}
    `}>
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none"></div>
      
      <div className="relative navbar max-w-7xl mx-auto flex items-center justify-between">
        <div className="navbar-start flex items-center">
          <Logo />
        </div>
        
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 space-x-2 flex-row">
            <li>
              <Link 
                href="/leaderboard" 
                className="
                  text-gray-200 hover:text-white font-medium px-4 py-2 rounded-lg
                  hover:bg-white/10 backdrop-blur-sm border border-transparent
                  hover:border-white/20 transition-all duration-300
                  hover:shadow-lg hover:shadow-yellow-500/20
                  relative group overflow-hidden
                "
              >
                <span className="relative z-10">Leaderboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-600/20 to-yellow-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="navbar-end flex items-center space-x-3">
          {/* Mobile menu dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <div 
              tabIndex={0} 
              role="button" 
              className="
                btn btn-ghost text-gray-200 hover:text-white hover:bg-white/10 
                border border-white/10 hover:border-white/20 backdrop-blur-sm
                transition-all duration-300
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <ul 
              tabIndex={0} 
              className="
                menu menu-sm dropdown-content mt-3 z-[1] p-3 shadow-2xl
                bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl w-52
                shadow-purple-500/20
              "
            >
              <li>
                <Link 
                  href="/leaderboard" 
                  className="
                    text-gray-200 hover:text-white hover:bg-white/10 rounded-lg
                    transition-all duration-300 border border-transparent hover:border-white/20
                  "
                >
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          
          <WalletConnector />
        </div>
      </div>
    </div>
  );
};

export default Navbar; 
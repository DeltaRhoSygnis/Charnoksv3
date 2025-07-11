
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { WORKER_NAVIGATION_ITEMS } from '../../constants';
import LogoutButton from '../ui/LogoutButton';

export const WorkerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = WORKER_NAVIGATION_ITEMS.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentPage ? currentPage.label : 'Dashboard';

  const MobileHeader: React.FC = () => (
    <div className="lg:hidden flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm sticky top-0 z-30 border-b border-border/30">
        <h1 className="text-xl font-bold text-text-primary">{pageTitle}</h1>
        <button onClick={() => setSidebarOpen(true)} className="text-text-primary p-2 -mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>
  );

  const Sidebar: React.FC = () => (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-black/50 backdrop-blur-lg p-4 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:bg-black/20 lg:backdrop-blur-sm
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between mb-6 h-16">
       <h1 className="text-2xl font-bold text-text-primary tracking-wider">Sari POS</h1>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-text-secondary p-2 -mr-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>
      </div>
      <nav className="flex-grow space-y-1">
        {WORKER_NAVIGATION_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/80 text-text-on-primary shadow-lg'
                  : 'text-text-secondary hover:bg-white/10 hover:text-text-primary'
              }`
            }
          >
            <span className="mr-4 text-2xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto">
          <LogoutButton />
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen w-full animate-gradient-x text-text-primary">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      <Sidebar />
      
      <div className="lg:pl-64">
          <MobileHeader />
          <main>
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
// Global styles
import 'antd/dist/reset.css';
import '../css/common.css';
import '../css/bootstrap.min.css';
import '../css/main.css';
import '../css/responsive.css';
import ReactDOM from 'react-dom/client';
import Login from './components/Login';
import Register from './components/register';
import Feed from './components/Feed/Feed';
import { User } from './types';
import { getSession, logoutUser } from './auth';

type Page = 'login' | 'register' | 'feed';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for active session
    const sessionUser = getSession();
    if (sessionUser) {
      setUser(sessionUser as User);
      setCurrentPage('feed');
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('feed');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentPage('login');
  };

  if (isInitializing) {
    return <div className="h-screen flex items-center justify-center bg-gray-100 text-gray-500">Loading BuddyScript...</div>;
  }



  return (
    <>
      {currentPage === 'login' && (
        <Login
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentPage('register')}
        />
      )}

      {currentPage === 'register' && (
        <Register
          onLogin={handleLogin}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'feed' && user && (
        <Feed currentUser={user} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;

// If this file is used as the Vite entry, mount the App automatically
if (typeof document !== 'undefined') {
  const rootEl = document.getElementById('react-root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

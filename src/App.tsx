import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { TeacherLogin } from './pages/TeacherLogin';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { Admin } from './pages/Admin';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };

    const handleCustomRouteChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCurrentPath(customEvent.detail.path);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('route-change', handleCustomRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('route-change', handleCustomRouteChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home />;
      case '/courses':
        return <Courses />;
      case '/teacher/login':
        return <TeacherLogin />;
      case '/teacher/dashboard':
        return <TeacherDashboard />;
      case '/admin':
        return <Admin />;
      default:
        return <Home />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        {/* {currentPath !== '/admin' && currentPath !== '/teacher/login' && ( */}
        <Navbar currentPath={currentPath} />
        {/* // )} */}
        {renderPage()}
      </div>
    </AuthProvider>
  );
}

export default App;

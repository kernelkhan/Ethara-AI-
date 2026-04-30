import React, { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Menu, X, Moon, Sun } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <span className="text-xl font-bold text-primary">TaskMaster</span>
        <button onClick={toggleSidebar} className="btn-ghost mobile-menu-btn" style={{ padding: '0.25rem' }}>
          <X size={24} />
        </button>
      </div>
      <div className="sidebar-content">
        <div style={{ marginBottom: '2rem' }}>
          <p className="text-sm font-medium text-muted-foreground">Welcome back,</p>
          <p className="text-lg font-semibold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
          <span className="badge badge-blue" style={{ marginTop: '0.25rem' }}>
            {user?.role}
          </span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `nav-link stagger-${index + 1} ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="sidebar-footer">
        <button
          onClick={logout}
          className="nav-link stagger-4"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none' }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--destructive)'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="layout-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
      
      <div className="main-content-wrapper">
        <header className="top-header">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost mobile-menu-btn" style={{ padding: '0.5rem' }}>
            <Menu size={24} />
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleDarkMode} className="btn-ghost" style={{ padding: '0.5rem', borderRadius: '9999px' }}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

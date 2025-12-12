import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Package, ClipboardList, ShoppingCart, Table, BarChart3, Monitor, ChefHat, Settings } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  const dailyOperations = [
    { path: '/pos', label: 'POS', icon: ShoppingCart },
    { path: '/tables', label: 'Tables', icon: Table },
    { path: '/kds', label: 'KDS View', icon: Monitor },
  ];

  const inventory = [
    { path: '/admin/items', label: 'Items', icon: Package },
    { path: '/admin/stock', label: 'Stock Entry', icon: ClipboardList },
  ];

  const reports = [
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <ChefHat className="logo-icon" />
          </div>
          <h1>Janatha Hotel</h1>
        </div>
        
        <div className="nav-sections">
          <div className="nav-section">
            <div className="nav-section-title">DAILY OPERATION</div>
            <ul className="nav-list">
              {dailyOperations.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">INVENTORY</div>
            <ul className="nav-list">
              {inventory.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">ANALYTICS</div>
            <ul className="nav-list">
              {reports.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          <Link to="/settings" className="footer-link">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;


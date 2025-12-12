import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminItems from './pages/AdminItems';
import StockEntry from './pages/StockEntry';
import POSOrder from './pages/POSOrder';
import TableOrders from './pages/TableOrders';
import DailyReports from './pages/DailyReports';
import KDSView from './pages/KDSView';
import { socketService } from './services/socket';

function App() {
  useEffect(() => {
    // Connect socket on app mount
    socketService.connect();
    
    return () => {
      // Disconnect socket on app unmount
      socketService.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="admin/items" element={<AdminItems />} />
          <Route path="admin/stock" element={<StockEntry />} />
          <Route path="pos" element={<POSOrder />} />
          <Route path="tables" element={<TableOrders />} />
          <Route path="reports" element={<DailyReports />} />
          <Route path="kds" element={<KDSView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;



import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HallPage } from './pages/HallPage';
import { KitchenPage } from './pages/KitchenPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/hall" element={<HallPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/hall" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

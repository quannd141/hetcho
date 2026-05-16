import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/home.page.js';
import { SelectServicePage } from './pages/select-service.page.js';
import { SelectSlotPage } from './pages/select-slot.page.js';
import { ConfirmPage } from './pages/confirm.page.js';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tenants/:slug" element={<HomePage />} />
      <Route path="/tenants/:slug/services" element={<SelectServicePage />} />
      <Route path="/tenants/:slug/slot/:serviceId" element={<SelectSlotPage />} />
      <Route path="/tenants/:slug/confirm" element={<ConfirmPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

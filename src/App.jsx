import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import SiteHeader from './components/SiteHeader';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import NavigatePage from './pages/NavigatePage';

function Footer() {
  const { pathname } = useLocation();
  if (pathname !== '/') return null;
  return (
    <footer className="border-t border-sand bg-cream">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-8 text-xs text-ink/70 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-[72px]">
        <span className="font-display text-base tracking-[0.12em] text-ink">UNIPATH</span>
        <span>Indoor navigation for the academic block · Main Building and Civil Dept. Building</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-cream text-ink">
        <SiteHeader />
        <main className="flex-1">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/navigate" element={<NavigatePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

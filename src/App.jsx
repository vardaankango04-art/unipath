import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import OpeningAnimation from './components/OpeningAnimation';
import ErrorBoundary from './components/ErrorBoundary';
import MapPage from './pages/MapPage';
import ExplorePage from './pages/ExplorePage';
import LocationsPage from './pages/LocationsPage';
import ClassroomsPage from './pages/ClassroomsPage';
import LaboratoriesPage from './pages/LaboratoriesPage';
import FacultyPage from './pages/FacultyPage';
import SavedPage from './pages/SavedPage';

function AppContent() {
  // Opening animation state: runs briefly on initial load (1-2s)
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('unipath_session_loaded');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('unipath_session_loaded', 'true');
    setShowIntro(false);
  };

  // Shared bookmarks state with localStorage persistence
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('unipath_bookmarked_ids');
      return saved ? JSON.parse(saved) : ['classroom-101', 'laboratory-1', 'faculty-cabin-101', 'library-reading-room'];
    } catch {
      return ['classroom-101', 'laboratory-1', 'faculty-cabin-101', 'library-reading-room'];
    }
  });

  const handleToggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('unipath_bookmarked_ids', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleResetBookmarks = () => {
    const defaults = ['classroom-101', 'laboratory-1', 'faculty-cabin-101', 'library-reading-room'];
    setBookmarkedIds(defaults);
    try {
      localStorage.setItem('unipath_bookmarked_ids', JSON.stringify(defaults));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-[#09090B] dark:text-[#FFFFFF] font-sans antialiased selection:bg-[#09090B] selection:text-white dark:selection:bg-[#FFFFFF] dark:selection:text-[#09090B]">
      {/* 1-2s Brand Opening Animation on Application Launch */}
      {showIntro && <OpeningAnimation onComplete={handleIntroComplete} />}

      {/* Top Header with dynamic time-based greeting and Theme Toggle */}
      <Header />

      {/* Main Page Area: Public Campus Navigation (Opens directly at /map) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/map" replace />} />
            <Route 
              path="/map" 
              element={
                <MapPage 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark} 
                />
              } 
            />
            <Route 
              path="/explore" 
              element={
                <ExplorePage 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark} 
                />
              } 
            />
            <Route 
              path="/locations" 
              element={
                <LocationsPage 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark} 
                />
              } 
            />
            <Route 
              path="/classrooms" 
              element={
                <ClassroomsPage 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark} 
                />
              } 
            />
            <Route 
              path="/laboratories" 
              element={
                <LaboratoriesPage 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark} 
                />
              } 
            />
            <Route 
              path="/faculty" 
              element={
                <FacultyPage 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark} 
                />
              } 
            />
            <Route 
              path="/saved" 
              element={
                <SavedPage 
                  bookmarkedIds={bookmarkedIds} 
                  onToggleBookmark={handleToggleBookmark}
                  onResetBookmarks={handleResetBookmarks}
                />
              } 
            />
            {/* Personal student profile removed from public navigation; redirect to map */}
            <Route path="/profile" element={<Navigate to="/map" replace />} />
            <Route path="*" element={<Navigate to="/map" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Glossy Deep Ocean Bottom Navigation (Map, Explore, Saved) */}
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;

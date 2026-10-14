import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { DatasetManagerPage } from './pages/DatasetManagerPage';
import { ModelTrainingPage } from './pages/ModelTrainingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictPage } from './pages/PredictPage';
import { ImageAnalyzerPage } from './pages/ImageAnalyzerPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const { isAuthenticated, isDemoMode, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');

  // If user is authenticated or enters demo mode, transition from landing to dashboard
  useEffect(() => {
    if (isAuthenticated && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="animate-spin w-10 h-10 border-2 border-iris-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm font-semibold tracking-wider text-slate-300">
            Initializing Iris Machine Learning Platform...
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'dataset_manager':
        return <DatasetManagerPage onNavigate={setCurrentPage} />;
      case 'model_training':
        return <ModelTrainingPage onNavigate={setCurrentPage} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'predict':
        return <PredictPage />;
      case 'image_analyzer':
        return <ImageAnalyzerPage />;
      case 'ai_assistant':
        return <AIAssistantPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  const isStandalonePage = ['landing', 'login', 'register'].includes(currentPage);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

      {/* Main Body */}
      {isStandalonePage ? (
        <main className="flex-1">{renderContent()}</main>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

          {/* Page Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      )}
    </div>
  );
};

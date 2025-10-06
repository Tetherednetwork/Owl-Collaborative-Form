
import React, { useState, useCallback, ReactNode } from 'react';
import { FormDefinition, FormSubmissions } from './types';
import FormBuilder from './components/FormBuilder';
import CollaborativeForm from './components/CollaborativeForm';
import { Header } from './components/Header';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import { LoadingSpinner } from './components/icons/LoadingSpinner';

type View = 'builder' | 'collaborative';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [view, setView] = useState<View>('builder');
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmissions>({});
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleFormCreate = useCallback((definition: FormDefinition) => {
    setFormDefinition(definition);
    setView('collaborative');
  }, []);

  const handleSectionSubmit = useCallback((sectionId: string, data: Record<string, any>, userEmail: string) => {
    setFormSubmissions(prev => ({
      ...prev,
      [sectionId]: {
        data: data,
        submittedAt: new Date(),
        submittedBy: userEmail,
      }
    }));
  }, []);

  const handleReset = () => {
    setFormDefinition(null);
    setFormSubmissions({});
    setView('builder');
    setHeaderActions(null);
    if (currentUser) {
      localStorage.removeItem(`formBuilderDraft_${currentUser.email}`);
      showToast('Form reset and draft cleared.');
    }
  };
  
  const showToast = (message: string) => {
    setToastMessage(message);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen font-sans">
      <Header onReset={handleReset} actions={headerActions} />
      <main className="container mx-auto p-4 md:p-8">
        {view === 'builder' && <FormBuilder onFormCreate={handleFormCreate} setHeaderActions={setHeaderActions} onReset={handleReset} showToast={showToast} />}
        
        {view === 'collaborative' && formDefinition && (
          <CollaborativeForm
            definition={formDefinition}
            submissions={formSubmissions}
            onSectionSubmit={handleSectionSubmit}
          />
        )}
      </main>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

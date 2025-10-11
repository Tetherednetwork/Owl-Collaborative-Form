
import React, { useState, useCallback, ReactNode, useEffect } from 'react';
import { FormDefinition, FormSubmissions, User, DraftForm, FormVersion } from './types';
import FormBuilder from './components/FormBuilder';
import CollaborativeForm from './components/CollaborativeForm';
import { Header } from './components/Header';
import Toast from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import { LoadingSpinner } from './components/icons/LoadingSpinner';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import FormGenerator from './components/FormGenerator';
import { generateFormStructure } from './services/geminiService';
import { ErrorDisplay } from './components/ErrorDisplay';
import VersionHistoryModal from './components/VersionHistoryModal';

type View = 'landing' | 'auth' | 'home' | 'generator' | 'builder' | 'collaborative';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [view, setView] = useState<View>('home');
  
  // App-wide state
  const [savedForms, setSavedForms] = useState<DraftForm[]>([]);
  const [publishedForms, setPublishedForms] = useState<FormDefinition[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, FormSubmissions>>({});
  
  const [activeForm, setActiveForm] = useState<FormDefinition | null>(null);
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string|null>(null);
  const [historyModalDraft, setHistoryModalDraft] = useState<DraftForm | null>(null);


  // Load data from localStorage on user change
  useEffect(() => {
    if (currentUser) {
      try {
        const saved = localStorage.getItem(`draftForms_${currentUser.email}`);
        const published = localStorage.getItem(`publishedForms_${currentUser.email}`);
        const subs = localStorage.getItem(`submissions_${currentUser.email}`);
        if (saved) setSavedForms(JSON.parse(saved));
        if (published) setPublishedForms(JSON.parse(published));
        if (subs) setSubmissions(JSON.parse(subs));
      } catch (e) {
        console.error("Failed to load user data from localStorage", e);
      }
      setView('home');
    } else {
      setView('landing');
      // Clear data on logout
      setSavedForms([]);
      setPublishedForms([]);
      setSubmissions({});
      setActiveForm(null);
    }
  }, [currentUser]);
  
  // Persist data to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(`draftForms_${currentUser.email}`, JSON.stringify(savedForms));
        localStorage.setItem(`publishedForms_${currentUser.email}`, JSON.stringify(publishedForms));
        localStorage.setItem(`submissions_${currentUser.email}`, JSON.stringify(submissions));
      } catch(e) {
        console.error("Failed to save user data to localStorage", e);
      }
    }
  }, [savedForms, publishedForms, submissions, currentUser]);
  
  const showToast = (message: string) => {
    setToastMessage(message);
  };
  
  const handleGoHome = () => {
    setActiveForm(null);
    setView('home');
  }

  const handleCreateNew = () => {
    setActiveForm(null);
    setView('generator');
  };

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const definition = await generateFormStructure(prompt);
      setActiveForm(definition);
      setView('builder');
    } catch (error: any) {
      setGenerationError(error.message || "An unknown error occurred.");
      setView('generator'); // Stay on the generator page to show the error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditDraft = (formId: string) => {
    const draft = savedForms.find(f => f.id === formId);
    if (draft && draft.versions.length > 0) {
      setActiveForm(draft.versions[0].definition); // Edit the latest version
      setView('builder');
    }
  };

  const handleViewPublished = (formId: string) => {
    const form = publishedForms.find(f => f.id === formId);
    if (form) {
      setActiveForm(form);
      setView('collaborative');
    }
  };

  const handleSaveDraft = (form: FormDefinition) => {
    const newVersion: FormVersion = {
      versionId: `v_${Date.now()}`,
      savedAt: new Date().toISOString(),
      definition: form,
    };

    setSavedForms(prev => {
      const existingDraftIndex = prev.findIndex(d => d.id === form.id);
      
      if (existingDraftIndex > -1) {
        // Update existing draft
        const updatedDrafts = [...prev];
        const updatedDraft = { ...updatedDrafts[existingDraftIndex] };
        updatedDraft.versions.unshift(newVersion); // Add new version to the top
        updatedDrafts[existingDraftIndex] = updatedDraft;
        return updatedDrafts;
      } else {
        // Create new draft
        const newDraft: DraftForm = {
          id: form.id,
          versions: [newVersion],
        };
        return [...prev, newDraft];
      }
    });

    setActiveForm(form); // Keep active form in sync
    showToast('Draft saved successfully!');
  };

  const handlePublish = (form: FormDefinition) => {
    // Remove from drafts
    setSavedForms(prev => prev.filter(f => f.id !== form.id));
    // Add to published forms (update if already exists)
    setPublishedForms(prev => {
      const existingIndex = prev.findIndex(f => f.id === form.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = form;
        return updated;
      }
      return [...prev, form];
    });
    setActiveForm(form);
    setView('collaborative');
    showToast('Form published and collaboration started!');
  };
  
  const handleDeleteDraft = (formId: string) => {
    setSavedForms(prev => prev.filter(f => f.id !== formId));
    showToast('Draft deleted.');
  };
  
  const handleDeletePublished = (formId: string) => {
    setPublishedForms(prev => prev.filter(f => f.id !== formId));
    setSubmissions(prev => {
      const newSubs = { ...prev };
      delete newSubs[formId];
      return newSubs;
    });
    showToast('Published form and its data deleted.');
  };

  const handleSectionSubmit = (sectionId: string, data: Record<string, any>, userEmail: string) => {
    if (!activeForm) return;
    
    setSubmissions(prev => ({
      ...prev,
      [activeForm.id]: {
        ...(prev[activeForm.id] || {}),
        [sectionId]: {
          data: data,
          submittedAt: new Date(),
          submittedBy: userEmail,
        }
      }
    }));
  };

  const handleViewHistory = (formId: string) => {
    const draft = savedForms.find(d => d.id === formId);
    if (draft) {
      setHistoryModalDraft(draft);
    }
  };

  const handleRevertDraft = (formId: string, versionId: string) => {
    setSavedForms(prev => {
      const draftIndex = prev.findIndex(d => d.id === formId);
      if (draftIndex === -1) return prev;

      const draft = prev[draftIndex];
      const versionToRevert = draft.versions.find(v => v.versionId === versionId);
      if (!versionToRevert) return prev;
      
      // Create a new version based on the old one, marking it as the latest
      const revertedVersion: FormVersion = {
        versionId: `v_${Date.now()}`,
        savedAt: new Date().toISOString(),
        definition: versionToRevert.definition,
      };

      const updatedDraft = { ...draft };
      updatedDraft.versions.unshift(revertedVersion);

      const newSavedForms = [...prev];
      newSavedForms[draftIndex] = updatedDraft;
      return newSavedForms;
    });
    setHistoryModalDraft(null);
    showToast('Draft reverted to previous version.');
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <LoadingSpinner />
      </div>
    );
  }

  const renderContent = () => {
    if (!currentUser) {
      switch (view) {
        case 'auth': return <AuthPage />;
        default: return <LandingPage onLoginClick={() => setView('auth')} onSignupClick={() => setView('auth')} />;
      }
    }
    
    // Logged-in user views
    switch (view) {
      case 'home':
        return <HomePage 
          user={currentUser}
          savedForms={savedForms}
          publishedForms={publishedForms}
          onCreateNew={handleCreateNew}
          onEditDraft={handleEditDraft}
          onViewPublished={handleViewPublished}
          onDeleteDraft={handleDeleteDraft}
          onDeletePublished={handleDeletePublished}
          onViewHistory={handleViewHistory}
        />;
      case 'generator':
        return (
          <div className="py-12">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <LoadingSpinner />
                <p className="text-slate-600">Generating your form...</p>
              </div>
            ) : (
              <>
                <FormGenerator onGenerate={handleGenerate} />
                {generationError && <ErrorDisplay message={generationError} onRetry={() => setGenerationError(null)} />}
              </>
            )}
          </div>
        );
      case 'builder':
        return activeForm && <FormBuilder 
          key={activeForm.id} // Re-mount component when form changes
          formDefinition={activeForm} 
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          setHeaderActions={setHeaderActions} 
          showToast={showToast}
        />;
      case 'collaborative':
        return activeForm && <CollaborativeForm
            definition={activeForm}
            submissions={submissions[activeForm.id] || {}}
            onSectionSubmit={handleSectionSubmit}
          />;
      default:
        setView('home'); // Fallback to home
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-slate-100">
      <Header onHomeClick={handleGoHome} actions={headerActions} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      {historyModalDraft && (
        <VersionHistoryModal
          draft={historyModalDraft}
          onClose={() => setHistoryModalDraft(null)}
          onRevert={handleRevertDraft}
        />
      )}
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
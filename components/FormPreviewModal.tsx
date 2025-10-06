import React, { useState } from 'react';
import { FormDefinition, FormSubmissions } from '../types';
import CollaborativeForm from './CollaborativeForm';

interface FormPreviewModalProps {
  definition: FormDefinition;
  onClose: () => void;
}

const FormPreviewModal: React.FC<FormPreviewModalProps> = ({ definition, onClose }) => {
  const [previewSubmissions, setPreviewSubmissions] = useState<FormSubmissions>({});

  const handlePreviewSubmit = (sectionId: string, data: Record<string, any>) => {
    setPreviewSubmissions(prev => ({
      ...prev,
      [sectionId]: {
        data,
        submittedAt: new Date(),
        submittedBy: 'preview.user@example.com',
      }
    }));
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-xl font-bold text-slate-800">Form Preview</h2>
          <button 
            onClick={onClose} 
            className="text-3xl font-light text-slate-500 hover:text-slate-800 transition-colors"
            aria-label="Close preview"
          >
            &times;
          </button>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            <CollaborativeForm
              definition={definition}
              submissions={previewSubmissions}
              onSectionSubmit={handlePreviewSubmit}
              isPreview={true}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default FormPreviewModal;
import React, { useState } from 'react';
import { DraftForm, FormDefinition } from '../types';
import FormPreviewModal from './FormPreviewModal';
import { EyeIcon } from './icons/EyeIcon';
import { RefreshCwIcon } from './icons/RefreshCwIcon';

interface VersionHistoryModalProps {
  draft: DraftForm;
  onClose: () => void;
  onRevert: (formId: string, versionId: string) => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ draft, onClose, onRevert }) => {
  const [previewDefinition, setPreviewDefinition] = useState<FormDefinition | null>(null);

  const handleRevertClick = (versionId: string) => {
    if (window.confirm('Are you sure you want to revert to this version? A new version will be created from this point.')) {
      onRevert(draft.id, versionId);
    }
  };

  return (
    <>
      {previewDefinition && (
        <FormPreviewModal definition={previewDefinition} onClose={() => setPreviewDefinition(null)} />
      )}
      <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <header className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Version History</h2>
                <p className="text-sm text-slate-500 truncate max-w-md">{draft.versions[0].definition.name}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-3xl font-light text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close history"
            >
              &times;
            </button>
          </header>
          <main className="flex-1 overflow-y-auto p-6 space-y-3">
            {draft.versions.map((version, index) => (
              <div key={version.versionId} className="p-4 border rounded-lg flex justify-between items-center bg-slate-50/50">
                <div>
                  <p className="font-semibold text-slate-700">
                    Version saved on
                  </p>
                  <span className="text-sm text-slate-600">
                    {new Date(version.savedAt).toLocaleString()}
                  </span>
                  {index === 0 && (
                    <span className="ml-2 text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Latest
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDefinition(version.definition)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                    title="Preview this version"
                  >
                    <EyeIcon /> Preview
                  </button>
                  <button
                    onClick={() => handleRevertClick(version.versionId)}
                    disabled={index === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    title={index === 0 ? "This is the latest version" : "Revert to this version"}
                  >
                    <RefreshCwIcon /> Revert
                  </button>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </>
  );
};

// New RefreshCwIcon component for the revert button
const RefreshCwIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
);

export default VersionHistoryModal;

import React, { useState } from 'react';
import { FormDefinition, FormSubmissions } from '../types';
import FormSectionComponent from './FormSection';
import { DownloadIcon } from './icons/DownloadIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UserIcon } from './icons/UserIcon';
import { themes } from './themes';
import { useAuth } from '../contexts/AuthContext';

// FIX: Add type declarations for jspdf and html2canvas on the window object
// These libraries are likely loaded via script tags and this informs TypeScript of their existence.
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface CollaborativeFormProps {
  definition: FormDefinition;
  submissions: FormSubmissions;
  onSectionSubmit: (sectionId: string, data: Record<string, any>, userEmail: string) => void;
  isPreview?: boolean;
}

const CollaborativeForm: React.FC<CollaborativeFormProps> = ({ definition, submissions, onSectionSubmit, isPreview = false }) => {
  const { currentUser } = useAuth();
  const currentUserEmail = isPreview ? 'preview.user@example.com' : currentUser?.email || '';

  const theme = definition.theme;
  const sections = definition.sections;

  const activeStepIndex = sections.findIndex(sec => !submissions[sec.id]);
  const allSectionsComplete = activeStepIndex === -1;

  const handleDownloadPdf = () => {
    const { jsPDF } = window.jspdf;
    const formElement = document.getElementById('form-container');
    if (formElement) {
        window.html2canvas(formElement, { scale: 2, backgroundColor: theme.styles.container.split(' ').find(c => c.startsWith('bg-')) ? null : '#ffffff' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            let width = pdfWidth;
            let height = width / ratio;

            if (height > pdfHeight) {
                height = pdfHeight;
                width = height * ratio;
            }

            const xOffset = (pdfWidth - width) / 2;
            const yOffset = (pdfHeight - height) / 2;

            pdf.addImage(imgData, 'PNG', xOffset, yOffset, width, height);
            pdf.save('collaborative-form.pdf');
        });
    }
  };
  
  const handleSectionSubmit = (sectionId: string, data: Record<string, any>) => {
    onSectionSubmit(sectionId, data, currentUserEmail);
  }

  const containerStyle: React.CSSProperties = {};
  const customContainerStyles = theme.customStyles?.container;
  if (customContainerStyles) {
      if (customContainerStyles.backgroundColor) {
          containerStyle.backgroundColor = customContainerStyles.backgroundColor;
      }
      if (customContainerStyles.textColor) {
          containerStyle.color = customContainerStyles.textColor;
      }
      if (customContainerStyles.backgroundImage) {
          containerStyle.backgroundImage = `url(${customContainerStyles.backgroundImage})`;
          containerStyle.backgroundSize = 'cover';
          containerStyle.backgroundPosition = 'center';
          containerStyle.backgroundAttachment = 'fixed';
      }
  }

  return (
    <div className={`${theme.styles.container} transition-colors duration-300`} style={containerStyle}>
      <div className="mb-10">
        <div className="flex items-center">
            {sections.map((section, index) => {
                const calculatedActiveStep = allSectionsComplete ? sections.length : activeStepIndex;
                const isCompleted = index < calculatedActiveStep;
                const isActive = index === calculatedActiveStep;
                
                return (
                    <React.Fragment key={section.id}>
                        <div 
                          className="flex flex-col items-center text-center w-32"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                                isCompleted ? theme.styles.stepper.completed : isActive ? theme.styles.stepper.active : theme.styles.stepper.pending
                            }`}>
                                {isCompleted ? <CheckCircleIcon /> : <span>{index + 1}</span>}
                            </div>
                            <p className={`mt-2 text-sm break-words ${isActive ? 'font-bold' : ''}`}>{section.title}</p>
                        </div>
                        {index < sections.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${isCompleted ? theme.styles.stepper.completed : theme.styles.stepper.pending}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold">Your Collaborative Form</h2>
            <p className="mt-1 text-slate-600">Fill out your assigned section in order. Submissions will appear for everyone to see.</p>
        </div>
         <button
            onClick={handleDownloadPdf}
            disabled={!allSectionsComplete && !isPreview}
            className={`inline-flex items-center px-4 py-2 font-semibold text-white rounded-lg shadow-md transition-all ${
                allSectionsComplete || isPreview
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-slate-400 cursor-not-allowed'
            }`}
        >
            {allSectionsComplete || isPreview ? <DownloadIcon /> : <CheckCircleIcon />}
            <span className="ml-2">{allSectionsComplete || isPreview ? 'Download PDF' : 'Complete all steps'}</span>
        </button>
      </div>

      <div id="form-container" className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${theme.className}`}>
        {sections.map((section, index) => {
           const status = submissions[section.id]
                ? 'completed'
                : index === activeStepIndex
                    ? 'active'
                    : 'pending';
          
          return (
            <FormSectionComponent
              key={section.id}
              section={section}
              submission={submissions[section.id]}
              onSubmit={(data) => handleSectionSubmit(section.id, data)}
              currentUserEmail={currentUserEmail}
              status={status}
              theme={theme}
              isPreview={isPreview}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CollaborativeForm;

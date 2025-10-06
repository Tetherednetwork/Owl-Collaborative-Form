import React, { useState, useMemo, useEffect, useCallback, ReactNode, useRef } from 'react';
import { FormDefinition, FormSection, FormField, FormFieldType } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import FormElementsPanel from './form-builder/FormElementsPanel';
import PropertiesPanel from './form-builder/PropertiesPanel';
import { TrashIcon } from './icons/TrashIcon';
import FormFieldIcon from './form-builder/FormFieldIcon';
import { SaveIcon } from './icons/SaveIcon';
import { EyeIcon } from './icons/EyeIcon';
import FormPreviewModal from './FormPreviewModal';
import { FormTheme, themes } from './themes';
import { useAuth } from '../contexts/AuthContext';

interface FormBuilderProps {
  onFormCreate: (definition: FormDefinition) => void;
  setHeaderActions: (actions: ReactNode | null) => void;
  onReset: () => void;
  showToast: (message: string) => void;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ onFormCreate, setHeaderActions, onReset, showToast }) => {
  const [sections, setSections] = useState<FormSection[]>([]);
  const [theme, setTheme] = useState<FormTheme>(themes.default);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { currentUser } = useAuth();
  const draftKey = useMemo(() => `formBuilderDraft_${currentUser?.email || 'guest'}`, [currentUser]);

  // Load from draft on initial render
  useEffect(() => {
     try {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        const { theme: savedTheme, sections: savedSections } = JSON.parse(savedDraft);
        if (Array.isArray(savedSections) && savedSections.length > 0) {
            setSections(savedSections);
            if (typeof savedTheme === 'object' && savedTheme !== null) {
              setTheme(savedTheme);
            } else if (typeof savedTheme === 'string' && themes[savedTheme]) {
              setTheme(themes[savedTheme]);
            } else {
              setTheme(themes.default);
            }
            return;
        }
      }
    } catch (error) {
      console.error("Failed to load form draft from localStorage", error);
      localStorage.removeItem(draftKey);
    }
    // Set default state if no valid draft is found
    setSections([
      {
          id: `section_${Date.now()}`,
          title: 'Section 1',
          description: 'Description for section 1.',
          assignedTo: '',
          fields: [],
          showSubmitterEmail: true,
      }
    ]);
  }, [draftKey]);

  // Memoize the selected item to avoid re-calculating on every render
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    for (const section of sections) {
        if (section.id === selectedItemId) {
            return { type: 'section', data: section as FormSection };
        }
        const field = section.fields.find(f => f.id === selectedItemId);
        if (field) {
            return { type: 'field', data: field as FormField, sectionId: section.id };
        }
    }
    return null;
  }, [selectedItemId, sections]);

  const addSection = () => {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: ``,
      assignedTo: '',
      fields: [],
      showSubmitterEmail: true,
    };
    setSections(prevSections => [...prevSections, newSection]);
    setSelectedItemId(newSection.id);
  };

  const updateSection = (sectionId: string, updatedValues: Partial<FormSection>) => {
    setSections(prev => prev.map(sec => (sec.id === sectionId ? { ...sec, ...updatedValues } : sec)));
  };
  
  const removeSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter(sec => sec.id !== sectionId));
    if (selectedItemId === sectionId) {
        setSelectedItemId(null);
    }
  };

  const addField = (sectionId: string, fieldType: FormFieldType, index: number) => {
    const newField: FormField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: `${fieldType}_${Date.now()}`,
      label: 'New Field',
      type: fieldType,
      required: false,
    };
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        const newFields = [...sec.fields];
        newFields.splice(index, 0, newField);
        return { ...sec, fields: newFields };
      }
      return sec;
    }));
    setSelectedItemId(newField.id);
  };
  
  const updateField = (sectionId: string, fieldId: string, updatedValues: Partial<FormField>) => {
    setSections(prev => prev.map(sec => {
        if (sec.id === sectionId) {
            return {
                ...sec,
                fields: sec.fields.map(f => (f.id === fieldId ? { ...f, ...updatedValues } : f)),
            };
        }
        return sec;
    }));
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections(prev => prev.map(sec => {
        if (sec.id === sectionId) {
            return { ...sec, fields: sec.fields.filter(f => f.id !== fieldId) };
        }
        return sec;
    }));
    if (selectedItemId === fieldId) {
        setSelectedItemId(null);
    }
  };

  const moveField = (draggedFieldId: string, sourceSectionId: string, targetSectionId: string, targetIndex: number) => {
      let draggedField: FormField | undefined;
      
      // Remove field from source
      const newSections = sections.map(section => {
          if (section.id === sourceSectionId) {
              draggedField = section.fields.find(f => f.id === draggedFieldId);
              return { ...section, fields: section.fields.filter(f => f.id !== draggedFieldId) };
          }
          return section;
      });

      if (!draggedField) return;

      // Add field to target
      setSections(newSections.map(section => {
          if (section.id === targetSectionId) {
              const newFields = [...section.fields];
              newFields.splice(targetIndex, 0, draggedField!);
              return { ...section, fields: newFields };
          }
          return section;
      }));
  };

  const moveSection = useCallback((draggedSectionId: string, targetIndex: number) => {
    setSections(prevSections => {
      const draggedSection = prevSections.find(s => s.id === draggedSectionId);
      if (!draggedSection) return prevSections;
  
      const sectionsWithoutDragged = prevSections.filter(s => s.id !== draggedSectionId);
      
      const newSections = [
        ...sectionsWithoutDragged.slice(0, targetIndex),
        draggedSection,
        ...sectionsWithoutDragged.slice(targetIndex),
      ];
  
      return newSections;
    });
  }, []);
  
  const handleSaveDraft = useCallback(() => {
    try {
      const draft = { theme, sections };
      localStorage.setItem(draftKey, JSON.stringify(draft));
      showToast('Draft saved successfully!');
    } catch (e) {
      console.error('Failed to save draft:', e);
      showToast('Error saving draft.');
    }
  }, [theme, sections, showToast, draftKey]);

  useEffect(() => {
    setHeaderActions(
      <>
        <button
          onClick={() => setIsPreviewing(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white/10 text-white rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#272458] focus:ring-white transition-colors"
        >
          <EyeIcon />
          <span className="ml-2">Preview</span>
        </button>
        <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium bg-white/10 text-white rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#272458] focus:ring-white transition-colors"
        >
            Start Over
        </button>
        <button
          onClick={handleSaveDraft}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#00a4d7] rounded-md hover:bg-[#0093c4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#272458] focus:ring-white transition-colors"
        >
          <SaveIcon />
          <span className="ml-2">Save Draft</span>
        </button>
      </>
    );

    return () => {
      setHeaderActions(null);
    };
  }, [handleSaveDraft, setHeaderActions, setIsPreviewing, onReset]);

  const handleCreateForm = () => {
    setError(null);
    const incompleteAssignments = sections.some(s => s.assignedTo.trim() === '' || !s.assignedTo.includes('@'));
    if (incompleteAssignments) {
        setError('All sections must be assigned to a valid email address.');
        return;
    }
    const sectionsWithFields = sections.filter(s => s.fields.length > 0);
    if (sectionsWithFields.length < 1) {
        setError('You must add at least one field to at least one section.');
        return;
    }
    localStorage.removeItem(draftKey);
    onFormCreate({ theme, sections: sectionsWithFields });
  };

  return (
    <>
      {isPreviewing && (
        <FormPreviewModal 
          definition={{ theme, sections }} 
          onClose={() => setIsPreviewing(false)} 
        />
      )}
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
            <div className='text-center sm:text-left'>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 font-semibold">
                Build Your Form
                </h1>
                <p className="mt-2 text-lg text-slate-600">
                Drag, drop, and click to design your collaborative form.
                </p>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 min-h-[70vh]">
            <FormElementsPanel />
            
            <main className="flex-grow w-full md:w-1/2 p-4 bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200">
                <FormCanvas 
                    sections={sections}
                    selectedItemId={selectedItemId}
                    onSelect={setSelectedItemId}
                    onAddField={addField}
                    onRemoveField={removeField}
                    onMoveField={moveField}
                    onRemoveSection={removeSection}
                    onMoveSection={moveSection}
                />
                <div className="mt-8 flex justify-center">
                    <button
                    onClick={addSection}
                    className="inline-flex items-center justify-center px-6 py-3 font-semibold text-[#00a4d7] bg-white border-2 border-dashed border-slate-300 hover:border-[#00a4d7] hover:bg-slate-50 rounded-lg"
                    >
                    <PlusCircleIcon />
                    <span className="ml-2">Add Form Section</span>
                    </button>
                </div>
            </main>
            
            <PropertiesPanel 
                selectedItem={selectedItem}
                theme={theme}
                onUpdateField={updateField}
                onUpdateSection={updateSection}
                onUpdateTheme={setTheme}
                onClose={() => setSelectedItemId(null)}
            />
        </div>

        <div className="mt-10 text-center">
            {error && <p className="text-red-600 mb-4" role="alert">{error}</p>}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                onClick={handleCreateForm}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-12 py-4 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.styles.button.primary}`}
                >
                Finalize & Start Collaboration
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

interface FormCanvasProps {
    sections: FormSection[];
    selectedItemId: string | null;
    onSelect: (id: string | null) => void;
    onAddField: (sectionId: string, fieldType: FormFieldType, index: number) => void;
    onRemoveField: (sectionId: string, fieldId: string) => void;
    onMoveField: (draggedFieldId: string, sourceSectionId: string, targetSectionId: string, targetIndex: number) => void;
    onRemoveSection: (sectionId: string) => void;
    onMoveSection: (draggedSectionId: string, targetIndex: number) => void;
}

const DragHandleIcon: React.FC = () => (
    <svg viewBox="0 0 20 20" className="h-5 w-5 text-slate-500" fill="currentColor">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
    </svg>
);


const FormCanvas: React.FC<FormCanvasProps> = ({ sections, selectedItemId, onSelect, onAddField, onRemoveField, onMoveField, onRemoveSection, onMoveSection }) => {
    // Shared state
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [draggedItemType, setDraggedItemType] = useState<'field' | 'section' | null>(null);

    // State for field drag-and-drop
    const [fieldDropTarget, setFieldDropTarget] = useState<{sectionId: string; index: number} | null>(null);

    // State for section drag-and-drop
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [sectionDropIndex, setSectionDropIndex] = useState<number | null>(null);
    
    useEffect(() => {
        sectionRefs.current = sectionRefs.current.slice(0, sections.length);
    }, [sections]);

    // --- GENERIC DRAG HANDLERS ---
    const handleDragEnd = () => {
        setDraggedItemId(null);
        setDraggedItemType(null);
        setFieldDropTarget(null);
        setSectionDropIndex(null);
    };

    // --- FIELD DRAG-AND-DROP ---
    const handleFieldDragStart = (e: React.DragEvent, fieldId: string, sectionId: string) => {
        e.stopPropagation(); // Prevent section drag from firing
        e.dataTransfer.setData('fieldId', fieldId);
        e.dataTransfer.setData('sourceSectionId', sectionId);
        setDraggedItemId(fieldId);
        setDraggedItemType('field');
    };

    const handleFieldDragOver = (e: React.DragEvent, sectionId: string, index: number) => {
        if (draggedItemType === 'section') return;
        e.preventDefault();
        e.stopPropagation();
        setFieldDropTarget({ sectionId, index });
    };

    const handleFieldDrop = (e: React.DragEvent, sectionId: string) => {
        if (draggedItemType === 'section') return;
        e.preventDefault();
        e.stopPropagation();
        
        const targetIndex = fieldDropTarget?.sectionId === sectionId
          ? fieldDropTarget.index
          : sections.find(s => s.id === sectionId)?.fields.length || 0;

        const fieldType = e.dataTransfer.getData('fieldType') as FormFieldType;
        const fieldId = e.dataTransfer.getData('fieldId');
        
        if (fieldType) {
            onAddField(sectionId, fieldType, targetIndex);
        } else if (fieldId) {
            const sourceSectionId = e.dataTransfer.getData('sourceSectionId');
            onMoveField(fieldId, sourceSectionId, sectionId, targetIndex);
        }
        
        handleDragEnd();
    };

    // --- SECTION DRAG-AND-DROP ---
    const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
        e.dataTransfer.setData('sectionId', sectionId);
        setDraggedItemId(sectionId);
        setDraggedItemType('section');
    };

    const handleCanvasDragOver = (e: React.DragEvent) => {
        if (draggedItemType !== 'section' || !draggedItemId) return;
        e.preventDefault();

        let closestIndex = sections.length;
        let smallestDistance = Infinity;

        sectionRefs.current.forEach((ref, index) => {
            if (ref) {
                const rect = ref.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                const distance = Math.abs(e.clientY - midY);

                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestIndex = e.clientY < midY ? index : index + 1;
                }
            }
        });
        
        // Prevent dropping a section onto itself
        const draggedIndex = sections.findIndex(s => s.id === draggedItemId);
        if (closestIndex === draggedIndex || closestIndex === draggedIndex + 1) {
            setSectionDropIndex(null);
        } else {
            setSectionDropIndex(closestIndex);
        }
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        if (draggedItemType !== 'section' || sectionDropIndex === null || !draggedItemId) return;
        e.preventDefault();
        
        const currentDraggedIndex = sections.findIndex(s => s.id === draggedItemId);
        // Adjust index if moving item downwards
        const adjustedIndex = sectionDropIndex > currentDraggedIndex ? sectionDropIndex - 1 : sectionDropIndex;

        onMoveSection(draggedItemId, adjustedIndex);
        handleDragEnd();
    };

    return (
        <div 
            className="space-y-4"
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
            onDragLeave={() => setSectionDropIndex(null)}
        >
            {sections.map((section, index) => (
                <React.Fragment key={section.id}>
                    {draggedItemType === 'section' && sectionDropIndex === index && <DropIndicator />}
                    <div 
                        ref={el => sectionRefs.current[index] = el}
                        className={`bg-white backdrop-blur-sm rounded-lg border transition-all ${selectedItemId === section.id ? 'border-[#00a4d7] ring-2 ring-[#00a4d7]/50' : 'border-slate-200'} ${draggedItemId === section.id ? 'opacity-30' : ''}`}
                        onClick={() => onSelect(section.id)}
                    >
                        <div
                            draggable
                            onDragStart={(e) => handleSectionDragStart(e, section.id)}
                            onDragEnd={handleDragEnd}
                            className="flex justify-between items-start p-3 cursor-grab"
                        >
                            <div className="flex items-start gap-2">
                                <span className="pt-1"><DragHandleIcon /></span>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                                    <p className="text-xs text-slate-400 mt-2">Assigned to: {section.assignedTo || 'Not assigned'}</p>
                                </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); onRemoveSection(section.id); }} disabled={sections.length <= 1} className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-50"><TrashIcon /></button>
                        </div>
                        
                        <div
                            className="mt-2 space-y-2 p-3 pt-0"
                            onDrop={(e) => handleFieldDrop(e, section.id)}
                            onDragOver={(e) => handleFieldDragOver(e, section.id, section.fields.length)}
                        >
                            {section.fields.length > 0 ? (
                                section.fields.map((field, fieldIndex) => (
                                    <React.Fragment key={field.id}>
                                        {fieldDropTarget?.sectionId === section.id && fieldDropTarget?.index === fieldIndex && <DropIndicator />}
                                        <div
                                            draggable
                                            onDragStart={(e) => handleFieldDragStart(e, field.id, section.id)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => handleFieldDragOver(e, section.id, fieldIndex)}
                                            onClick={(e) => { e.stopPropagation(); onSelect(field.id); }}
                                            className={`p-4 rounded-md border-2 border-transparent transition-all cursor-grab hover:border-[#00a4d7]/50 group ${selectedItemId === field.id ? 'bg-indigo-50 border-[#00a4d7]' : 'bg-slate-50'} ${draggedItemId === field.id ? 'opacity-30 shadow-lg' : ''}`}
                                        >
                                            <label className="block text-sm font-medium text-slate-800 flex items-center justify-between">
                                                <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onRemoveField(section.id, field.id); }} 
                                                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <TrashIcon/>
                                                </button>
                                            </label>
                                            <div className="mt-2 pointer-events-none">
                                                <FormFieldPreview field={field} />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))
                            ) : (
                                 <div
                                    onDragOver={(e) => handleFieldDragOver(e, section.id, 0)}
                                    className={`text-center p-6 border-2 border-dashed rounded-md transition-colors ${
                                        fieldDropTarget?.sectionId === section.id 
                                            ? 'border-[#00a4d7] bg-indigo-50 text-indigo-700' 
                                            : 'border-slate-300 text-slate-500'
                                    }`}
                                >
                                    {fieldDropTarget?.sectionId === section.id ? 'Drop Element Here' : 'Drag and drop a form element here'}
                                </div>
                            )}
                            {section.fields.length > 0 && fieldDropTarget?.sectionId === section.id && fieldDropTarget?.index === section.fields.length && <DropIndicator />}
                        </div>
                    </div>
                </React.Fragment>
            ))}
            {draggedItemType === 'section' && sectionDropIndex === sections.length && <DropIndicator />}
        </div>
    );
};

const DropIndicator = () => <div className="h-1.5 my-2 bg-[#00a4d7] rounded-full animate-pulse"></div>

const FormFieldPreview: React.FC<{field: FormField}> = ({field}) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-slate-400"><FormFieldIcon type={field.type}/></span>
            <span className="text-sm text-slate-500 w-full">{field.placeholder || `Preview for ${field.type.replace(/_/g, ' ')}`}</span>
        </div>
    )
}

export default FormBuilder;

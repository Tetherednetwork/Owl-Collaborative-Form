import React from 'react';
import { FormField, FormSection, FormFieldType } from '../../types';
import { themes, FormTheme } from '../themes';
import { TrashIcon } from '../icons/TrashIcon';

interface PropertiesPanelProps {
  selectedItem: { type: 'field', data: FormField, sectionId: string } | { type: 'section', data: FormSection } | null;
  theme: FormTheme;
  onUpdateField: (sectionId: string, fieldId: string, updatedValues: Partial<FormField>) => void;
  onUpdateSection: (sectionId: string, updatedValues: Partial<FormSection>) => void;
  onUpdateTheme: (theme: FormTheme) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedItem, theme, onUpdateField, onUpdateSection, onUpdateTheme, onClose }) => {
  
  const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClose();
  }

  return (
    <aside className="w-full md:w-80 p-4 bg-slate-50/70 backdrop-blur-sm rounded-lg border border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900 capitalize">
                {selectedItem ? `${selectedItem.type} Properties` : 'Form Properties'}
            </h2>
            {selectedItem && (
                 <button onClick={handleClose} className="p-1 text-slate-400 hover:text-slate-800">&times;</button>
            )}
        </div>
      
      {!selectedItem && (
          <FormProperties 
            theme={theme}
            onUpdateTheme={onUpdateTheme}
          />
      )}
      {selectedItem?.type === 'field' && (
        <FieldProperties 
            field={selectedItem.data} 
            sectionId={selectedItem.sectionId} 
            onUpdate={onUpdateField} 
        />
      )}
      {selectedItem?.type === 'section' && (
        <SectionProperties 
            section={selectedItem.data} 
            onUpdate={onUpdateSection} 
        />
      )}
    </aside>
  );
};

const ThemeColorPreview: React.FC<{ theme: FormTheme }> = ({ theme }) => {
    // Extract representative colors. Be robust against complex class strings.
    const containerBg = theme.styles.container.split(' ').find(c => c.startsWith('bg-')) || 'bg-white';
    const primaryButtonBg = theme.styles.button.primary.split(' ').find(c => c.startsWith('bg-')) || 'bg-black';
    const activeStepperBg = theme.styles.stepper.active.split(' ').find(c => c.startsWith('bg-')) || 'bg-yellow-500';
    const containerText = theme.styles.container.split(' ').find(c => c.startsWith('text-')) || 'text-black';

    return (
        <div className="flex items-center gap-1.5 mt-2">
            <div className={`w-5 h-5 rounded-full border border-slate-300 ${containerBg} flex items-center justify-center`}>
                <div className={`w-2 h-2 rounded-full ${containerText.replace('text-','bg-')}`}></div>
            </div>
            <div className={`w-5 h-5 rounded-full border border-slate-300 ${primaryButtonBg}`}></div>
            <div className={`w-5 h-5 rounded-full border border-slate-300 ${activeStepperBg}`}></div>
        </div>
    );
};

const FormProperties: React.FC<{theme: FormTheme, onUpdateTheme: (theme: FormTheme) => void}> = ({theme, onUpdateTheme}) => {
    const handleThemeSelect = (themeKey: string) => {
        onUpdateTheme(themes[themeKey]);
    };

    const handleStyleChange = (updates: NonNullable<NonNullable<FormTheme['customStyles']>['container']>) => {
        const baseName = theme.name.split(' (Custom)')[0];
        onUpdateTheme({
            ...theme,
            name: `${baseName} (Custom)`,
            customStyles: {
                ...theme.customStyles,
                container: {
                    ...theme.customStyles?.container,
                    ...updates,
                }
            }
        });
    };

    const handleBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleStyleChange({ backgroundImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Reset file input
    };

    const customContainerStyles = theme.customStyles?.container || {};

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700">Form Theme Presets</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(themes).map(([key, themeOption]) => (
                    <button
                        key={key}
                        onClick={() => handleThemeSelect(key)}
                        className={`p-3 text-left rounded-md border-2 transition-all ${
                            theme.name.startsWith(themeOption.name) ? 'border-[#00a4d7] ring-2 ring-[#00a4d7]/50' : 'border-slate-200 bg-white hover:border-[#00a4d7]'
                        }`}
                    >
                        <span className="font-semibold text-sm">{themeOption.name}</span>
                        <ThemeColorPreview theme={themeOption} />
                    </button>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-md font-semibold text-slate-900">Customize Theme</h3>
                <p className="text-sm text-slate-500 mb-4">Changes will apply on top of the selected preset.</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="bgColor" className="block text-sm font-medium text-slate-700">Background Color</label>
                        <div className="mt-1 flex items-center gap-2">
                            <input
                                id="bgColor"
                                type="color"
                                value={customContainerStyles.backgroundColor || '#f8fafc'}
                                onChange={e => handleStyleChange({ backgroundColor: e.target.value })}
                                className="h-8 w-10 p-0 border-none rounded-md cursor-pointer"
                                style={{backgroundColor: customContainerStyles.backgroundColor || '#f8fafc'}}
                            />
                            <span className="text-sm text-slate-500">{customContainerStyles.backgroundColor || 'Default'}</span>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="textColor" className="block text-sm font-medium text-slate-700">Text Color</label>
                         <div className="mt-1 flex items-center gap-2">
                            <input
                                id="textColor"
                                type="color"
                                value={customContainerStyles.textColor || '#334155'}
                                onChange={e => handleStyleChange({ textColor: e.target.value })}
                                className="h-8 w-10 p-0 border-none rounded-md cursor-pointer"
                                style={{backgroundColor: customContainerStyles.textColor || '#334155'}}
                            />
                             <span className="text-sm text-slate-500">{customContainerStyles.textColor || 'Default'}</span>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Background Image</label>
                        {customContainerStyles.backgroundImage ? (
                             <div className="mt-2 relative">
                                 <img src={customContainerStyles.backgroundImage} alt="Background" className="w-full h-24 object-cover rounded-md border" />
                                 <button
                                     onClick={() => handleStyleChange({ backgroundImage: undefined })}
                                     className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"
                                     aria-label="Remove background image"
                                 >
                                     <TrashIcon />
                                 </button>
                             </div>
                        ) : (
                             <div className="mt-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBgImageChange}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const FieldProperties: React.FC<{field: FormField, sectionId: string, onUpdate: PropertiesPanelProps['onUpdateField']}> = ({field, sectionId, onUpdate}) => {
    const update = (values: Partial<FormField>) => {
        onUpdate(sectionId, field.id, values);
    };

    const hasValidationOptions = [
        FormFieldType.SHORT_TEXT,
        FormFieldType.LONG_TEXT,
        FormFieldType.NUMBER,
        FormFieldType.PERCENTAGE,
        FormFieldType.EMAIL,
        FormFieldType.MULTI_TEXT,
    ].includes(field.type);

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="label" className="block text-sm font-medium text-slate-700">Label Text</label>
                <input id="label" type="text" value={field.label} onChange={e => update({label: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" />
            </div>
            
            {[FormFieldType.DROPDOWN, FormFieldType.SINGLE_CHOICE, FormFieldType.MULTIPLE_CHOICE].includes(field.type) && (
                <div>
                    <label htmlFor="options" className="block text-sm font-medium text-slate-700">Options (one per line)</label>
                    <textarea id="options" value={(field.options || []).join('\n')} onChange={e => update({options: e.target.value.split('\n')})} rows={4} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" />
                </div>
            )}

            {field.type === FormFieldType.SCALE_RATING && (
                <>
                    <div>
                        <label htmlFor="scaleMinLabel" className="block text-sm font-medium text-slate-700">Min Label</label>
                        <input id="scaleMinLabel" type="text" value={field.scaleMinLabel || ''} onChange={e => update({scaleMinLabel: e.target.value})} placeholder="e.g., Not Satisfied" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" />
                    </div>
                     <div>
                        <label htmlFor="scaleMaxLabel" className="block text-sm font-medium text-slate-700">Max Label</label>
                        <input id="scaleMaxLabel" type="text" value={field.scaleMaxLabel || ''} onChange={e => update({scaleMaxLabel: e.target.value})} placeholder="e.g., Very Satisfied" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" />
                    </div>
                </>
            )}

            {hasValidationOptions && (
                 <div className="pt-4 mt-4 border-t border-slate-200 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-900">Validation Rules</h4>
                    
                    {[FormFieldType.SHORT_TEXT, FormFieldType.LONG_TEXT, FormFieldType.MULTI_TEXT].includes(field.type) && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="minLength" className="block text-xs font-medium text-slate-600">Min Length</label>
                                <input id="minLength" type="number" min="0" value={field.minLength ?? ''} onChange={e => update({minLength: e.target.value ? parseInt(e.target.value) : undefined})} className="mt-1 block w-full px-2 py-1 border border-slate-300 rounded-md text-sm bg-white text-slate-900" />
                            </div>
                            <div>
                                <label htmlFor="maxLength" className="block text-xs font-medium text-slate-600">Max Length</label>
                                <input id="maxLength" type="number" min="0" value={field.maxLength ?? ''} onChange={e => update({maxLength: e.target.value ? parseInt(e.target.value) : undefined})} className="mt-1 block w-full px-2 py-1 border border-slate-300 rounded-md text-sm bg-white text-slate-900" />
                            </div>
                        </div>
                    )}
                     {[FormFieldType.NUMBER, FormFieldType.PERCENTAGE].includes(field.type) && (
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label htmlFor="min" className="block text-xs font-medium text-slate-600">Min Value</label>
                                <input id="min" type="number" value={field.min ?? ''} onChange={e => update({min: e.target.value ? parseFloat(e.target.value) : undefined})} className="mt-1 block w-full px-2 py-1 border border-slate-300 rounded-md text-sm bg-white text-slate-900" />
                            </div>
                            <div>
                                <label htmlFor="max" className="block text-xs font-medium text-slate-600">Max Value</label>
                                <input id="max" type="number" value={field.max ?? ''} onChange={e => update({max: e.target.value ? parseFloat(e.target.value) : undefined})} className="mt-1 block w-full px-2 py-1 border border-slate-300 rounded-md text-sm bg-white text-slate-900" />
                            </div>
                        </div>
                    )}
                    {[FormFieldType.SHORT_TEXT, FormFieldType.EMAIL, FormFieldType.LONG_TEXT, FormFieldType.MULTI_TEXT].includes(field.type) && (
                         <div>
                            <label htmlFor="pattern" className="block text-xs font-medium text-slate-600">Regex Pattern</label>
                            <input id="pattern" type="text" value={field.pattern || ''} placeholder="e.g., ^[A-Z]{2,3}$" onChange={e => update({pattern: e.target.value || undefined})} className="mt-1 block w-full px-2 py-1 border border-slate-300 rounded-md text-sm bg-white text-slate-900" />
                            <p className="text-xs text-slate-500 mt-1">A JavaScript regex pattern to match against.</p>
                        </div>
                    )}
                 </div>
            )}


            {field.type !== FormFieldType.DIVIDER &&
                <div className="pt-2">
                    <label className="flex items-center text-sm cursor-pointer">
                        <input type="checkbox" checked={field.required} onChange={e => update({required: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="ml-2 text-slate-700">Required Field</span>
                    </label>
                </div>
            }
        </div>
    )
}

const SectionProperties: React.FC<{section: FormSection, onUpdate: PropertiesPanelProps['onUpdateSection']}> = ({section, onUpdate}) => {
    const update = (values: Partial<FormSection>) => {
        onUpdate(section.id, values);
    };
    
    return (
         <div className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">Section Title</label>
                <input id="title" type="text" value={section.title} onChange={e => update({title: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" />
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                <textarea id="description" value={section.description} onChange={e => update({description: e.target.value})} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" />
            </div>
             <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-700">Assign To (Email)</label>
                <input id="assignedTo" type="email" value={section.assignedTo} onChange={e => update({assignedTo: e.target.value})} placeholder="teammate@example.com" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900" />
            </div>
             <div className="pt-2">
                <label className="flex items-center text-sm cursor-pointer">
                    <input type="checkbox" checked={section.showSubmitterEmail} onChange={e => update({showSubmitterEmail: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="ml-2 text-slate-700">Show submitter's email</span>
                </label>
            </div>
        </div>
    )
}

export default PropertiesPanel;
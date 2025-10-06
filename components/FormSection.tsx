import React, { useState, FormEvent, useRef, useCallback, useEffect } from 'react';
import { FormSection, SectionSubmission, FormSectionStatus, FormFieldType, FormField } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { LockIcon } from './icons/LockIcon';
import { ClockIcon } from './icons/ClockIcon';
import SignaturePad from './SignaturePad';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StarIcon } from './icons/StarIcon';
import { FormTheme } from './themes';

interface FormSectionProps {
  section: FormSection;
  submission?: SectionSubmission;
  onSubmit: (data: Record<string, any>) => void;
  currentUserEmail: string;
  status: FormSectionStatus;
  theme: FormTheme;
  isPreview?: boolean;
}

// Helper: Star Rating Input Component
const StarRatingInput: React.FC<{ value: number, onChange: (value: number) => void }> = ({ value, onChange }) => {
    const [hoverValue, setHoverValue] = useState(0);
    const stars = Array(5).fill(0);

    return (
        <div className="flex items-center space-x-1">
            {stars.map((_, index) => (
                <button
                    type="button"
                    key={index}
                    onClick={() => onChange(index + 1)}
                    onMouseOver={() => setHoverValue(index + 1)}
                    onMouseLeave={() => setHoverValue(0)}
                    className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                    <StarIcon 
                        className={`h-8 w-8 transition-colors ${(hoverValue || value) > index ? 'text-amber-400' : 'text-slate-300'}`} 
                    />
                </button>
            ))}
        </div>
    );
};

const FormSectionComponent: React.FC<FormSectionProps> = ({ section, submission, onSubmit, currentUserEmail, status, theme, isPreview = false }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAssignedToCurrentUser = section.assignedTo.trim().toLowerCase() === currentUserEmail.trim().toLowerCase();
  
  const handleFormValueChange = useCallback((name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const processAndSubmit = async () => {
        const processedData = { ...formData };
        for (const field of section.fields) {
            if (field.type === FormFieldType.MULTIPLE_CHOICE && formData[field.name]) {
                processedData[field.name] = Object.entries(formData[field.name])
                    .filter(([, checked]) => checked)
                    .map(([option]) => option);
            }
            if (field.type === FormFieldType.FILE_UPLOAD && formData[field.name]) {
                processedData[field.name] = Array.from(formData[field.name] as FileList).map((f: File) => f.name).join(', ');
            }
            if (field.type === FormFieldType.IMAGE_UPLOAD && formData[field.name]) {
                const files = Array.from(formData[field.name] as FileList);
                if (files[0]) {
                    processedData[field.name] = await toBase64(files[0]);
                }
            }
        }
        onSubmit(processedData);
        // No need to setIsSubmitting(false) as the component will re-render to a 'completed' state.
    };
    
    processAndSubmit();
  };
  
  const renderFieldValue = (field: FormField, value: any) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      return <span className="text-slate-400">Not provided</span>;
    }
    
    switch (field.type) {
      case FormFieldType.SIGNATURE:
      case FormFieldType.IMAGE_UPLOAD:
        return value ? <img src={value} alt={field.label} className="h-20 border rounded-md" /> : null;
      case FormFieldType.FILE_UPLOAD:
      case FormFieldType.MULTI_TEXT:
      case FormFieldType.MULTIPLE_CHOICE:
        return Array.isArray(value) ? (
          <ul className="list-disc list-inside">
            {value.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        ) : value.toString();
      case FormFieldType.FULL_NAME:
        return `${value.firstName || ''} ${value.lastName || ''}`.trim();
      case FormFieldType.PERCENTAGE:
        return `${value}%`;
      case FormFieldType.STAR_RATING:
        return <div className="flex">{Array(5).fill(0).map((_, i) => <StarIcon key={i} className={`h-5 w-5 ${i < value ? 'text-amber-400' : 'text-slate-300'}`} />)}</div>;
      case FormFieldType.SCALE_RATING:
        return <strong>{value} out of 10</strong>;
      case FormFieldType.PRODUCT_LIST:
        return (
          <ul className="space-y-2">
            {(value as any[]).map((item, i) => <li key={i}>{item.quantity} x {item.name}</li>)}
          </ul>
        );
      default:
        return value.toString();
    }
  };
  
  if (status === 'completed' && submission) {
    const fieldsWithData = section.fields.filter(f => f.type !== FormFieldType.DIVIDER);
    return (
      <div className={`p-6 rounded-lg border shadow-sm transition-all ${theme.styles.section.completed}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold">{section.title}</h3>
                <p className="text-sm">Assigned to: {section.assignedTo}</p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
                <CheckCircleIcon />
                <span className="font-semibold">Completed</span>
            </div>
        </div>
        {section.showSubmitterEmail && (
          <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium">
                  Submitted by: <span className="font-normal">{submission.submittedBy}</span>
              </p>
          </div>
        )}
        <div className="mt-4 space-y-3">
          {fieldsWithData.map(field => (
            <div key={field.name}>
              <label className="text-sm font-medium">{field.label}</label>
              <div className="bg-opacity-50 p-2 rounded-md mt-1 break-words">
                {renderFieldValue(field, submission.data[field.name])}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className={`p-6 rounded-lg border shadow-sm ${theme.styles.section.pending}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold">{section.title}</h3>
                <p className="text-sm mt-2">{section.description}</p>
            </div>
            <div className="flex items-center gap-2">
                <ClockIcon />
                <span className="font-semibold">Pending</span>
            </div>
        </div>
        <div className="mt-4 text-center p-4 rounded-md">
            <p className="text-sm">This section is assigned to:</p>
            <p className="font-semibold">{section.assignedTo}</p>
            <p className="text-xs mt-2">Will unlock after the previous section is completed.</p>
        </div>
      </div>
    );
  }
  
  // Status is 'active'
  if (!isAssignedToCurrentUser && !isPreview) {
     return (
      <div className={`p-6 rounded-lg border shadow-sm opacity-70 ${theme.styles.section.pending}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold">{section.title}</h3>
                <p className="text-sm mt-2">{section.description}</p>
            </div>
            <div className="flex items-center gap-2">
                <LockIcon />
                <span className="font-semibold">Locked for you</span>
            </div>
        </div>
        <div className="mt-4 text-center p-4 rounded-md">
            <p className="text-sm">This section is assigned to:</p>
            <p className="font-semibold">{section.assignedTo}</p>
            <p className="text-xs mt-2">Enter this email above to unlock.</p>
        </div>
      </div>
    );
  }

  // Status is 'active' and assigned to current user (or is preview)
  return (
    <div className={`p-6 rounded-lg border shadow-lg transition-shadow ${theme.styles.section.active}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold">{section.title}</h3>
                <p className="text-sm">Assigned to: {isPreview ? section.assignedTo : `You (${section.assignedTo})`}</p>
                <p className="text-sm mt-2">{section.description}</p>
            </div>
             <div className="flex items-center gap-2 text-amber-600">
                <EditIcon />
                <span className="font-semibold">Your turn</span>
            </div>
        </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {section.fields.map(field => {
            const commonProps: any = {
                id: field.name,
                name: field.name,
                required: field.required,
                className: `block w-full px-3 py-2 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none sm:text-sm ${theme.styles.input}`
            };

            if (field.minLength !== undefined) commonProps.minLength = field.minLength;
            if (field.maxLength !== undefined) commonProps.maxLength = field.maxLength;
            if (field.min !== undefined) commonProps.min = field.min;
            if (field.max !== undefined) commonProps.max = field.max;
            if (field.pattern) commonProps.pattern = field.pattern;

            if (field.type === FormFieldType.DIVIDER) {
                return (
                    <div key={field.name} className="flex items-center py-2">
                        <hr className="flex-grow" />
                        <span className="mx-4 text-sm font-semibold">{field.label}</span>
                        <hr className="flex-grow" />
                    </div>
                );
            }

            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1">
                    {(() => {
                        switch (field.type) {
                            case FormFieldType.LONG_TEXT:
                                return <textarea {...commonProps} placeholder={field.placeholder} rows={4} onChange={e => handleFormValueChange(field.name, e.target.value)} />;
                            case FormFieldType.DROPDOWN:
                                return (
                                    <select {...commonProps} onChange={e => handleFormValueChange(field.name, e.target.value)}>
                                        <option value="">{field.placeholder || 'Select an option'}</option>
                                        {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                );
                            case FormFieldType.SINGLE_CHOICE:
                                return (
                                    <div className="space-y-2 rounded-md border p-3">
                                    {(field.options || []).map(opt => (
                                        <label key={opt} className="flex items-center text-sm">
                                        <input type="radio" name={field.name} value={opt} required={field.required} onChange={e => handleFormValueChange(field.name, e.target.value)} className="h-4 w-4 text-[#00a4d7] border-gray-300 focus:ring-[#00a4d7]" />
                                        <span className="ml-2">{opt}</span>
                                        </label>
                                    ))}
                                    </div>
                                );
                            case FormFieldType.MULTIPLE_CHOICE:
                                return (
                                    <div className="space-y-2 rounded-md border p-3">
                                    {(field.options || []).map(opt => (
                                        <label key={opt} className="flex items-center text-sm">
                                        <input type="checkbox" value={opt} onChange={e => {
                                            const current = formData[field.name] || {};
                                            handleFormValueChange(field.name, { ...current, [opt]: e.target.checked });
                                        }} className="h-4 w-4 rounded border-gray-300 text-[#00a4d7] focus:ring-[#00a4d7]" />
                                        <span className="ml-2">{opt}</span>
                                        </label>
                                    ))}
                                    </div>
                                );
                            case FormFieldType.FULL_NAME:
                                const { id: fullNameId, name: fullNameName, ...restFullNameProps } = commonProps;
                                return (
                                    <div className="flex gap-4">
                                        <input {...restFullNameProps} type="text" placeholder="First Name" onChange={e => handleFormValueChange(field.name, {...(formData[field.name] || {}), firstName: e.target.value})} />
                                        <input {...restFullNameProps} type="text" placeholder="Last Name" onChange={e => handleFormValueChange(field.name, {...(formData[field.name] || {}), lastName: e.target.value})} />
                                    </div>
                                );
                            case FormFieldType.PERCENTAGE:
                                return (
                                    <div className="relative">
                                        <input {...commonProps} type="number" min="0" max="100" placeholder={field.placeholder} onChange={e => handleFormValueChange(field.name, e.target.value)} />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">%</div>
                                    </div>
                                );
                            case FormFieldType.SIGNATURE:
                                return <SignaturePad value={formData[field.name]} onChange={dataUrl => handleFormValueChange(field.name, dataUrl)} />;
                            case FormFieldType.FILE_UPLOAD:
                                return <input {...commonProps} type="file" onChange={e => handleFormValueChange(field.name, e.target.files)} />;
                            case FormFieldType.IMAGE_UPLOAD:
                                const imageFile = formData[field.name]?.[0];
                                return (
                                    <div>
                                        <input {...commonProps} type="file" accept="image/*" onChange={e => handleFormValueChange(field.name, e.target.files)} />
                                        {imageFile && <img src={URL.createObjectURL(imageFile)} alt="Preview" className="mt-2 h-32 rounded-md border p-1" />}
                                    </div>
                                );
                            case FormFieldType.MULTI_TEXT:
                                 const texts = formData[field.name] || [''];
                                 const { id: multiTextId, name: multiTextName, ...restMultiTextProps } = commonProps;
                                 return (
                                    <div className="space-y-2">
                                        {texts.map((text: string, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={text}
                                                    onChange={e => {
                                                        const newTexts = [...texts];
                                                        newTexts[index] = e.target.value;
                                                        handleFormValueChange(field.name, newTexts);
                                                    }}
                                                    {...restMultiTextProps}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleFormValueChange(field.name, texts.filter((_: any, i: number) => i !== index))}
                                                    className="p-2 text-red-500 rounded-full hover:bg-red-500/20"
                                                    disabled={texts.length <= 1}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => handleFormValueChange(field.name, [...texts, ''])} className="text-sm text-[#00a4d7] flex items-center gap-1">
                                            <PlusCircleIcon/> Add another
                                        </button>
                                    </div>
                                );
                            case FormFieldType.TIME:
                                return <input {...commonProps} type="time" onChange={e => handleFormValueChange(field.name, e.target.value)} />;
                            case FormFieldType.STAR_RATING:
                                return <StarRatingInput value={formData[field.name] || 0} onChange={value => handleFormValueChange(field.name, value)} />;
                            case FormFieldType.SCALE_RATING:
                                return (
                                    <div className="p-3 border rounded-md">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>{field.scaleMinLabel || 'Not Satisfied'}</span>
                                            <span>{field.scaleMaxLabel || 'Very Satisfied'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            {Array(10).fill(0).map((_, i) => (
                                                <label key={i} className="flex flex-col items-center space-y-1 cursor-pointer">
                                                    <span className="text-sm">{i+1}</span>
                                                    <input type="radio" name={field.name} value={i+1} required={field.required} onChange={e => handleFormValueChange(field.name, e.target.value)} className="h-4 w-4 text-[#00a4d7] border-gray-300 focus:ring-[#00a4d7]" />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            case FormFieldType.PRODUCT_LIST:
                                const products = formData[field.name] || [{ name: '', quantity: 1 }];
                                const updateProduct = (index: number, newProduct: any) => {
                                    const newProducts = [...products];
                                    newProducts[index] = newProduct;
                                    handleFormValueChange(field.name, newProducts);
                                };
                                return (
                                    <div className="space-y-3">
                                        {products.map((prod: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2 p-2 rounded-md">
                                                <input type="number" placeholder="Qty" min="1" value={prod.quantity} onChange={e => updateProduct(index, {...prod, quantity: parseInt(e.target.value, 10) || 1 })} className="w-16 px-2 py-1 border rounded-md bg-white border-slate-300 text-slate-900" />
                                                <input type="text" placeholder="Product Name" value={prod.name} onChange={e => updateProduct(index, {...prod, name: e.target.value})} className="flex-grow px-2 py-1 border rounded-md bg-white border-slate-300 text-slate-900" />
                                                <button type="button" onClick={() => handleFormValueChange(field.name, products.filter((_: any, i: number) => i !== index))} className="p-2 text-red-500 rounded-full hover:bg-red-500/20" disabled={products.length <= 1}><TrashIcon /></button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => handleFormValueChange(field.name, [...products, {name: '', quantity: 1}])} className="text-sm text-[#00a4d7] flex items-center gap-1"><PlusCircleIcon/> Add Product</button>
                                    </div>
                                );
                            default: // Handles SHORT_TEXT, EMAIL, NUMBER, DATE, etc.
                                return <input {...commonProps} type={field.type} placeholder={field.placeholder} onChange={e => handleFormValueChange(field.name, e.target.value)} />;
                        }
                    })()}
                </div>
              </div>
            )
        })}
        <button type="submit" disabled={isSubmitting || isPreview} className={`w-full mt-4 px-4 py-2 font-semibold text-white rounded-lg shadow-md disabled:cursor-not-allowed ${theme.styles.button.primary} ${isSubmitting ? 'bg-slate-400' : ''}`}>
          {isSubmitting ? 'Submitting...' : 'Submit Section'}
        </button>
      </form>
    </div>
  );
};

export default FormSectionComponent;
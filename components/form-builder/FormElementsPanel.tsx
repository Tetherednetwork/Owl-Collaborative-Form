import React from 'react';
import { FormFieldType } from '../../types';
import FormFieldIcon from './FormFieldIcon';

const FORM_ELEMENTS = [
  { type: FormFieldType.SHORT_TEXT, label: 'Short Text' },
  { type: FormFieldType.LONG_TEXT, label: 'Long Text' },
  { type: FormFieldType.EMAIL, label: 'Email' },
  { type: FormFieldType.NUMBER, label: 'Number' },
  { type: FormFieldType.FULL_NAME, label: 'Full Name' },
  { type: FormFieldType.DATE, label: 'Date Picker' },
  { type: FormFieldType.TIME, label: 'Time Picker' },
  { type: FormFieldType.DROPDOWN, label: 'Dropdown' },
  { type: FormFieldType.SINGLE_CHOICE, label: 'Single Choice' },
  { type: FormFieldType.MULTIPLE_CHOICE, label: 'Multiple Choice' },
  { type: FormFieldType.IMAGE_UPLOAD, label: 'Image Upload' },
  { type: FormFieldType.FILE_UPLOAD, label: 'File Upload' },
  { type: FormFieldType.SIGNATURE, label: 'Signature' },
  { type: FormFieldType.STAR_RATING, label: 'Star Rating' },
  { type: FormFieldType.SCALE_RATING, label: 'Scale Rating' },
  { type: FormFieldType.PRODUCT_LIST, label: 'Product List' },
  { type: FormFieldType.DIVIDER, label: 'Divider' },
];

const FormElement: React.FC<{ type: FormFieldType; label: string }> = ({ type, label }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fieldType', type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center p-2 bg-white rounded-md border border-slate-200 cursor-grab hover:bg-slate-100 hover:border-indigo-500 transition-all"
    >
      <span className="text-indigo-600 mr-3"><FormFieldIcon type={type}/></span>
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </div>
  );
};

const FormElementsPanel: React.FC = () => {
  return (
    <aside className="w-full md:w-64 p-4 bg-slate-50/70 backdrop-blur-sm rounded-lg border border-slate-200">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Form Elements</h2>
      <div className="space-y-2">
        {FORM_ELEMENTS.map(element => (
          <FormElement key={element.type} type={element.type} label={element.label} />
        ))}
      </div>
    </aside>
  );
};

export default FormElementsPanel;
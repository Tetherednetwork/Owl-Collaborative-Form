import { FormTheme } from './components/themes';

export enum FormFieldType {
  SHORT_TEXT = 'short_text',
  LONG_TEXT = 'long_text',
  NUMBER = 'number',
  EMAIL = 'email',
  DATE = 'date',
  TIME = 'time',
  SIGNATURE = 'signature',
  DROPDOWN = 'dropdown',
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  FILE_UPLOAD = 'file_upload',
  IMAGE_UPLOAD = 'image_upload',
  MULTI_TEXT = 'multi_text',
  FULL_NAME = 'full_name',
  PERCENTAGE = 'percentage',
  STAR_RATING = 'star_rating',
  SCALE_RATING = 'scale_rating',
  PRODUCT_LIST = 'product_list',
  DIVIDER = 'divider',
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  fields: FormField[];
  showSubmitterEmail: boolean;
}

export interface FormDefinition {
  theme: FormTheme;
  sections: FormSection[];
}

export interface SectionSubmission {
  data: Record<string, any>;
  submittedAt: Date;
  submittedBy: string;
}

export type FormSubmissions = Record<string, SectionSubmission>;

export type FormSectionStatus = 'completed' | 'active' | 'pending';

export interface User {
  email: string;
}

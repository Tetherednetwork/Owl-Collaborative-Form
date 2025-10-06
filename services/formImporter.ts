import { FormField, FormFieldType } from '../types';

// A mock database of known form structures.
// In a real application, this would be a backend service that scrapes and parses the URL.
const MOCK_FORMS: FormField[][] = [
  [ // Client Onboarding
    // FIX: Property 'TEXT' does not exist on type 'typeof FormFieldType'. Changed to SHORT_TEXT.
    // FIX: Add missing 'id' property.
    { id: 'fullName', name: 'fullName', label: 'Full Name', type: FormFieldType.SHORT_TEXT, placeholder: 'Jane Doe', required: true },
    // FIX: Add missing 'id' property.
    { id: 'emailAddress', name: 'emailAddress', label: 'Email Address', type: FormFieldType.EMAIL, placeholder: 'jane.doe@example.com', required: true },
    // FIX: Property 'TEXT' does not exist on type 'typeof FormFieldType'. Changed to SHORT_TEXT.
    // FIX: Add missing 'id' property.
    { id: 'projectName', name: 'projectName', label: 'Project Name', type: FormFieldType.SHORT_TEXT, placeholder: 'New Website Redesign', required: true },
    // FIX: Property 'TEXTAREA' does not exist on type 'typeof FormFieldType'. Changed to LONG_TEXT.
    // FIX: Add missing 'id' property.
    { id: 'projectDetails', name: 'projectDetails', label: 'Project Details', type: FormFieldType.LONG_TEXT, placeholder: 'Please describe the project...', required: false },
    // FIX: Add missing 'id' property.
    { id: 'launchDate', name: 'launchDate', label: 'Expected Launch Date', type: FormFieldType.DATE, placeholder: '', required: false },
  ],
  [ // Bug Report
      // FIX: Property 'TEXT' does not exist on type 'typeof FormFieldType'. Changed to SHORT_TEXT.
      // FIX: Add missing 'id' property.
      { id: 'bugSummary', name: 'bugSummary', label: 'Bug Summary', type: FormFieldType.SHORT_TEXT, placeholder: 'e.g., Login button not working', required: true },
      // FIX: Property 'TEXTAREA' does not exist on type 'typeof FormFieldType'. Changed to LONG_TEXT.
      // FIX: Add missing 'id' property.
      { id: 'reproSteps', name: 'reproSteps', label: 'Steps to Reproduce', type: FormFieldType.LONG_TEXT, placeholder: '1. Go to...\n2. Click on...\n3. See error...', required: true },
      // FIX: Property 'TEXT' does not exist on type 'typeof FormFieldType'. Changed to SHORT_TEXT.
      // FIX: Add missing 'id' property.
      { id: 'expectedResult', name: 'expectedResult', label: 'Expected Result', type: FormFieldType.SHORT_TEXT, placeholder: 'User should be logged in', required: true },
      // FIX: Property 'TEXT' does not exist on type 'typeof FormFieldType'. Changed to SHORT_TEXT.
      // FIX: Add missing 'id' property.
      { id: 'actualResult', name: 'actualResult', label: 'Actual Result', type: FormFieldType.SHORT_TEXT, placeholder: 'An error message appears', required: true },
  ]
];

// This function simulates fetching a form from a URL, parsing it,
// and returning a structured list of fields.
export const importFormFromURL = (url: string): Promise<FormField[]> => {
  return new Promise((resolve, reject) => {
    console.log(`Attempting to import form from: ${url}`);
    
    // Simulate network delay
    setTimeout(() => {
      const normalizedUrl = url.trim().toLowerCase();
      
      // Instead of an exact match, we'll check if it's a valid-looking URL from a known service.
      if (normalizedUrl.includes('jotform.com') || normalizedUrl.includes('typeform.com') || normalizedUrl.includes('google.com/forms')) {
        console.log('Detected a supported form URL. Returning a mock structure.');
        
        // Return one of the mock forms randomly to simulate different forms being imported.
        const mockFields = MOCK_FORMS[Math.floor(Math.random() * MOCK_FORMS.length)];

        // Add unique names to prevent collisions if imported multiple times
        const uniqueFields = mockFields.map(field => ({
            ...field,
            name: `${field.name.replace(/_\d+$/, '')}_${Date.now()}` // Ensure name is unique
        }));
        resolve(uniqueFields);
      } else {
        console.error('URL is not from a supported form service.');
        reject(new Error('Could not import form. Please use a URL from a known service like Jotform, Typeform, or Google Forms.'));
      }
    }, 1500); // 1.5 second delay
  });
};
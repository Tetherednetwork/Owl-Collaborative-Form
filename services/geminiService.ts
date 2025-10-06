
import { GoogleGenAI, Type } from "@google/genai";
import { FormDefinition, FormFieldType, FormSection } from '../types';
import { themes } from "../components/themes";

// This function should be defined in a secure backend in a real application
// but is included here for frontend-only demonstration purposes.
const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY environment variable not set.');
  }
  return apiKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const formSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: {
        type: Type.STRING,
        description: "A unique identifier for the section, e.g., 'project_overview'."
      },
      title: {
        type: Type.STRING,
        description: "The title of the form section, e.g., 'Project Overview'."
      },
      description: {
        type: Type.STRING,
        description: "A brief description of what this section is for."
      },
      assignedTo: {
        type: Type.STRING,
        description: "The role or person this section is assigned to, e.g., 'Project Manager'."
      },
      fields: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The programmatic name for the field, e.g., 'projectName'."
            },
            label: {
              type: Type.STRING,
              description: "The user-facing label for the field, e.g., 'Project Name'."
            },
            type: {
              type: Type.STRING,
              enum: Object.values(FormFieldType),
              description: "The input type for the field."
            },
            placeholder: {
                type: Type.STRING,
                description: "Optional placeholder text for the input field."
            },
            required: {
              type: Type.BOOLEAN,
              description: "Whether the field is required."
            }
          },
          required: ["name", "label", "type", "required"],
        }
      }
    },
    required: ["id", "title", "description", "assignedTo", "fields"],
  }
};

export const generateFormStructure = async (prompt: string): Promise<FormDefinition> => {
  try {
    const fullPrompt = `Based on the following request, generate a detailed, multi-section form structure. Each section should be assignable to a specific role.

Request: "${prompt}"

Generate the output as a JSON array following the provided schema. Ensure all field types are one of the allowed values: ${Object.values(FormFieldType).join(', ')}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: formSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Basic validation
    if (!Array.isArray(parsedJson)) {
        throw new Error("AI response is not a valid form structure array.");
    }
    
    // Add IDs to fields
    const sectionsWithFieldIds = (parsedJson as FormSection[]).map(section => ({
        ...section,
        fields: section.fields.map(field => ({
            ...field,
            id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        })),
        showSubmitterEmail: true,
    }));


    return {
        theme: themes.default,
        sections: sectionsWithFieldIds,
    };
  } catch (error) {
    console.error("Error generating form structure:", error);
    throw new Error("Failed to generate form from AI. Please check the console for details.");
  }
};


import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface FormGeneratorProps {
  onGenerate: (prompt: string) => void;
}

const examplePrompts = [
    "A new client onboarding form with sections for company details, project scope, and billing information.",
    "A bug report form for a software project. Sections for summary, reproduction steps, expected vs. actual results, and environment details.",
    "A weekly project status report with sections for accomplishments, upcoming tasks, and potential roadblocks."
];

const FormGenerator: React.FC<FormGeneratorProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
        Build a Collaborative Form with AI
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Describe the form you want to create. AI will generate the sections and fields, ready for your team to collaborate.
      </p>
      <form onSubmit={handleSubmit} className="mt-8">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Create a project proposal form with sections for Overview, Technical Specs, Budget, and Timeline.'"
          className="w-full h-32 p-4 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#00a4d7] focus:border-[#00a4d7] transition-shadow"
          required
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-[#00a4d7] rounded-lg shadow-md hover:bg-[#0093c4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a4d7] disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
        >
          <SparklesIcon />
          <span className="ml-2">Generate Form</span>
        </button>
      </form>
       <div className="mt-8 text-left">
        <h3 className="text-md font-semibold text-slate-500">Need inspiration? Try one of these:</h3>
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
            {examplePrompts.map((p, index) => (
                <button
                    key={index}
                    onClick={() => handleExampleClick(p)}
                    className="flex-1 text-sm text-left p-3 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                    {p}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FormGenerator;
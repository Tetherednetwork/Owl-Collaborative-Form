
import React, { useState } from 'react';
import { FormDefinition, User, DraftForm } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { LayoutDashboardIcon } from './icons/LayoutDashboardIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { SendIcon } from './icons/SendIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';

interface HomePageProps {
  user: User;
  savedForms: DraftForm[];
  publishedForms: FormDefinition[];
  onCreateNew: () => void;
  onEditDraft: (formId: string) => void;
  onViewPublished: (formId: string) => void;
  onDeleteDraft: (formId: string) => void;
  onDeletePublished: (formId: string) => void;
  onViewHistory: (formId: string) => void;
}

interface FormListItemProps {
  form: FormDefinition;
  actions: React.ReactNode;
  type: 'draft' | 'published';
}

const FormListItem: React.FC<FormListItemProps> = ({ form, actions, type }) => {
  return (
    <li className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 rounded-lg transition-colors group">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {type === 'draft' ? 
            <FileTextIcon className="h-5 w-5 text-slate-500" /> : 
            <SendIcon className="h-5 w-5 text-green-600" />
          }
        </div>
        <div>
          <p className="font-semibold text-slate-800">{form.name}</p>
          <p className="text-xs text-slate-500">
            {form.sections.length} sections
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {actions}
      </div>
    </li>
  );
};


const HomePage: React.FC<HomePageProps> = ({ user, savedForms, publishedForms, onCreateNew, onEditDraft, onViewPublished, onDeleteDraft, onDeletePublished, onViewHistory }) => {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900">Welcome back, {user.email.split('@')[0]}!</h1>
        <p className="mt-2 text-lg text-slate-600">Ready to build something great? Manage your forms or create a new one to get started.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Main actions */}
        <div className="md:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><LayoutDashboardIcon /> Dashboard</h2>
            <button
                onClick={onCreateNew}
                className="w-full flex items-center justify-center gap-2 p-6 bg-white text-[#00a4d7] border-2 border-dashed border-slate-300 hover:border-[#00a4d7] hover:bg-slate-50 rounded-xl transition-all"
            >
                <PlusCircleIcon />
                <span className="font-semibold">Create New Form</span>
            </button>
        </div>
        
        {/* Form Lists */}
        <div className="md:col-span-2 space-y-8">
            {/* Saved Drafts */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4"><FileTextIcon /> Saved Drafts</h2>
                {savedForms.length > 0 ? (
                    <ul className="space-y-2">
                        {savedForms.map(draft => (
                            <FormListItem
                                key={draft.id}
                                type="draft"
                                form={draft.versions[0].definition}
                                actions={
                                    <>
                                        <button onClick={() => onViewHistory(draft.id)} className="p-2 text-slate-500 hover:text-purple-600 rounded-full hover:bg-slate-200" title="History"><HistoryIcon /></button>
                                        <button onClick={() => onEditDraft(draft.id)} className="p-2 text-slate-500 hover:text-[#00a4d7] rounded-full hover:bg-slate-200" title="Edit"><EditIcon /></button>
                                        <button onClick={() => onDeleteDraft(draft.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100" title="Delete"><TrashIcon /></button>
                                    </>
                                }
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 p-4 bg-slate-100 rounded-lg text-center">You have no saved drafts.</p>
                )}
            </div>

            {/* Published Forms */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4"><SendIcon /> Published Forms</h2>
                 {publishedForms.length > 0 ? (
                    <ul className="space-y-2">
                        {publishedForms.map(form => (
                            <FormListItem
                                key={form.id}
                                type="published"
                                form={form}
                                actions={
                                     <>
                                        <button onClick={() => onViewPublished(form.id)} className="p-2 text-slate-500 hover:text-green-600 rounded-full hover:bg-green-100" title="View"><EyeIcon /></button>
                                        <button onClick={() => onDeletePublished(form.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-100" title="Delete"><TrashIcon /></button>
                                    </>
                                }
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 p-4 bg-slate-100 rounded-lg text-center">You haven't published any forms yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
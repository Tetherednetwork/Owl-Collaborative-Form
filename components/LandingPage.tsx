
import React from 'react';
import { Header } from './Header';
import { SparklesIcon } from './icons/SparklesIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SendIcon } from './icons/SendIcon';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="text-center p-6 bg-white rounded-lg shadow-lg">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-[#00a4d7]/20 text-[#00a4d7] mb-4 mx-auto">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-slate-600">{children}</p>
  </div>
);

const OwlLogoFooter: React.FC = () => (
    <div className="flex items-center gap-1.5 text-slate-800">
        <span className="text-2xl font-extrabold tracking-tighter">Owl</span>
        <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1b434]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#00a4d7]"></div>
        </div>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignupClick }) => {
  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={onLoginClick}
        className="px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
      >
        Login
      </button>
      <button
        onClick={onSignupClick}
        className="px-4 py-2 text-sm font-semibold text-white bg-[#00a4d7] rounded-lg hover:bg-[#0093c4] transition-colors"
      >
        Sign Up
      </button>
    </div>
  );

  return (
    <div className="bg-slate-50">
      <Header onHomeClick={() => {}} actions={headerActions} />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Build Collaborative Forms, Instantly
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
            Create, share, and manage forms with your team. Powered by AI, designed for collaboration.
          </p>
          <div className="mt-8">
            <button
              onClick={onSignupClick}
              className="px-8 py-3 font-semibold text-white bg-[#00a4d7] rounded-lg shadow-md hover:bg-[#0093c4] transition-all"
            >
              Get Started for Free
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <Feature icon={<SparklesIcon />} title="AI-Powered Generation">
              Describe your form and let AI build the structure for you.
            </Feature>
            <Feature icon={<UsersIcon />} title="Team Collaboration">
              Assign sections to team members and track progress in real-time.
            </Feature>
            <Feature icon={<SendIcon className="h-6 w-6" />} title="Seamless Workflow">
              Publish forms and collect data in a single, unified view.
            </Feature>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                <div className="col-span-2 md:col-span-1">
                    <OwlLogoFooter />
                    <p className="mt-4 text-sm text-slate-500">
                        The collaborative form builder for modern teams.
                    </p>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Product</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Features</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Pricing</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Templates</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Company</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">About Us</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Careers</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Resources</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Blog</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Help Center</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Legal</h3>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Owl Inc. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

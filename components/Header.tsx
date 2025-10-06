
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from './icons/UserIcon';


interface HeaderProps {
    onReset: () => void;
    actions?: React.ReactNode;
}

const OwlLogo: React.FC = () => (
    <div className="flex items-center gap-1.5 text-white">
        <span className="text-3xl font-extrabold tracking-tighter">Owl</span>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#f1b434]"></div>
            <div className="w-3 h-3 rounded-full bg-[#00a4d7]"></div>
        </div>
    </div>
);


export const Header: React.FC<HeaderProps> = ({ onReset, actions }) => {
    const { currentUser, logout } = useAuth();
    return (
        <header className="bg-[#272458] text-white shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <OwlLogo />
                     <div className="w-px h-8 bg-white/30 hidden sm:block"></div>
                    <h1 className="text-xl font-bold hidden sm:block">
                        Collaborative Form Builder
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    {actions ? actions : (
                        <button
                            onClick={onReset}
                            className="px-4 py-2 text-sm font-medium bg-white/10 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#272458] focus:ring-white transition-colors"
                        >
                            Start Over
                        </button>
                    )}
                    {currentUser && (
                        <>
                            <div className="w-px h-6 bg-white/30 hidden sm:block"></div>
                            <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-full" title={currentUser.email}>
                                <UserIcon className="h-5 w-5 text-white/80" />
                                <span className="hidden md:inline max-w-xs truncate">{currentUser.email}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium bg-white/10 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#272458] focus:ring-white transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

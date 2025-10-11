
export interface FormTheme {
  name: string;
  className: string; 
  customStyles?: {
    container?: {
      backgroundColor?: string;
      textColor?: string;
      backgroundImage?: string;
    }
  };
  styles: {
    container: string;
    section: {
      active: string;
      completed: string;
      pending: string;
    };
    button: {
      primary: string;
    };
    input: string;
    stepper: {
      completed: string;
      active: string;
      pending: string;
    };
  };
}

export const themes: Record<string, FormTheme> = {
  default: {
    name: 'Lovely Owl',
    className: 'theme-owl',
    styles: {
      container: 'bg-gradient-to-br from-sky-100 to-amber-100 text-slate-900',
      section: {
        active: 'bg-white/80 backdrop-blur-sm border-[#00a4d7] ring-2 ring-[#00a4d7]/50 shadow-lg',
        completed: 'bg-white/70 backdrop-blur-sm border-green-500/50',
        pending: 'bg-slate-50/70 backdrop-blur-sm border-slate-300',
      },
      button: {
        primary: 'bg-[#00a4d7] hover:bg-[#0093c4] focus:ring-[#00a4d7] text-white shadow-md hover:shadow-lg transition-all',
      },
      input: 'bg-white/70 border-slate-300 text-slate-900 focus:ring-[#00a4d7] focus:border-[#00a4d7] backdrop-blur-sm',
      stepper: {
        completed: 'bg-[#00a4d7]',
        active: 'bg-[#f1b434] ring-4 ring-[#f1b434]/50 shadow-md',
        pending: 'bg-slate-300',
      }
    }
  },
  modern: {
    name: 'Modern Dark',
    className: 'theme-modern',
    styles: {
      container: 'bg-gray-900 text-gray-100',
      section: {
        active: 'border-cyan-500 ring-2 ring-cyan-700 bg-gray-800',
        completed: 'border-emerald-600 bg-gray-800',
        pending: 'border-gray-700 bg-gray-800',
      },
      button: {
        primary: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500 text-white',
      },
      input: 'bg-gray-700 border-gray-600 text-white focus:ring-cyan-500 focus:border-cyan-500',
      stepper: {
        completed: 'bg-cyan-600',
        active: 'bg-yellow-500 ring-4 ring-yellow-700',
        pending: 'bg-gray-600',
      }
    }
  },
  minimalist: {
    name: 'Minimalist',
    className: 'theme-minimalist',
    styles: {
      container: 'bg-white text-black',
      section: {
        active: 'bg-white border-black ring-2 ring-gray-200',
        completed: 'bg-white border-gray-400',
        pending: 'bg-gray-50 border-gray-200',
      },
      button: {
        primary: 'bg-black hover:bg-gray-800 focus:ring-gray-500 text-white rounded-none',
      },
      input: 'bg-white border-gray-400 focus:ring-black focus:border-black rounded-none',
      stepper: {
        completed: 'bg-black',
        active: 'bg-black ring-4 ring-gray-200',
        pending: 'bg-gray-300',
      }
    }
  }
};
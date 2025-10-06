
import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="max-w-2xl mx-auto my-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
      <div className="flex flex-col items-center">
        <AlertTriangleIcon />
        <h3 className="mt-2 text-lg font-semibold text-red-800">An Error Occurred</h3>
        <p className="mt-1 text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

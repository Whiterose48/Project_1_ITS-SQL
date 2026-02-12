import React from 'react';

export default function Tabs({ selectedTab, onTabChange }) {
  return (
    <div className="bg-white rounded-t-lg shadow">
      <div className="flex border-b">
        <button
          onClick={() => onTabChange('description')}
          className={`
            px-6 py-3 font-semibold transition-colors
            ${selectedTab === 'description'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          DESCRIPTION
        </button>
        <button
          onClick={() => onTabChange('submissions')}
          className={`
            px-6 py-3 font-semibold transition-colors
            ${selectedTab === 'submissions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
            }
          `}
        >
          MY SUBMISSIONS
        </button>
      </div>
    </div>
  );
}

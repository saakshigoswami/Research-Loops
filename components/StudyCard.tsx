import React from 'react';
import { ResearchStudy } from '../types';
import { EnsProfile } from './EnsProfile';

interface StudyCardProps {
  study: ResearchStudy;
  onApply?: (study: ResearchStudy) => void;
  showApplyButton?: boolean;
}

export const StudyCard: React.FC<StudyCardProps> = ({ study, onApply, showApplyButton }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
          {study.category}
        </span>
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
          ${study.compensation}
        </span>
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-slate-900 line-clamp-1">{study.title}</h3>
        <EnsProfile name={study.researcherName} showDescription className="text-slate-500" />
      </div>
      
      <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">{study.description}</p>
      
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex items-center text-slate-500">
          <span className="mr-2">📍</span>
          {study.location}
        </div>
        <div className="flex items-center text-slate-500">
          <span className="mr-2">👤</span>
          <span className="font-medium text-slate-700 mr-1">Eligibility:</span> 
          <span className="line-clamp-1">{study.eligibility}</span>
        </div>
      </div>

      {showApplyButton && (
        <button
          onClick={() => onApply?.(study)}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-200"
        >
          Participate in Research
        </button>
      )}
    </div>
  );
};

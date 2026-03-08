import { useState } from 'react';
import { ClipboardList, Stethoscope, TestTube, Image } from 'lucide-react';
import { HistoryTab } from './HistoryTab';
import { ExamTab } from './ExamTab';
import { LabsTab } from './LabsTab';
import { ImagingTab } from './ImagingTab';
import type { Case } from '../../types';
import type { LucideIcon } from 'lucide-react';

const tabs: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'history', label: 'History', icon: ClipboardList },
  { id: 'exam', label: 'Exam', icon: Stethoscope },
  { id: 'labs', label: 'Labs', icon: TestTube },
  { id: 'imaging', label: 'Imaging', icon: Image },
];

interface InvestigationTabsProps {
  caseData: Case;
}

export function InvestigationTabs({ caseData }: InvestigationTabsProps) {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-black/10 mb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-px ${
              activeTab === id
                ? 'text-accent-primary border-accent-primary'
                : 'text-text-muted border-transparent hover:text-text-secondary hover:border-accent-primary/30'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'history' && <HistoryTab cards={caseData.history_cards} />}
        {activeTab === 'exam' && <ExamTab regions={caseData.exam_regions} />}
        {activeTab === 'labs' && <LabsTab panels={caseData.lab_panels} />}
        {activeTab === 'imaging' && <ImagingTab options={caseData.imaging_options} />}
      </div>
    </div>
  );
}

import React from 'react';
import { Briefcase, Clock, PlayCircle, PauseCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Project } from '../../../domain/types';
import { formatIndianCurrency } from '../../../utils/format';
import { useERPStore } from '../../../store/ERPStoreContext';

interface ProjectSummaryCardsProps {
  projects: Project[];
}

export const ProjectSummaryCards: React.FC<ProjectSummaryCardsProps> = ({ projects }) => {
  const { state } = useERPStore();
  const setupDrafts = state.projectSetupDrafts || [];

  // Filter actual finalized projects
  const finalizedProjects = projects.filter((p) => {
    const status = (p.projectStatus || p.status || '').toLowerCase();
    return status !== 'draft_setup' && status !== 'draft';
  });

  const totalCount = finalizedProjects.length;
  const activeCount = finalizedProjects.filter((p) => (p.projectStatus || p.status) === 'active').length;
  const onHoldCount = finalizedProjects.filter((p) => (p.projectStatus || p.status) === 'on_hold').length;
  const completedCount = finalizedProjects.filter((p) => (p.projectStatus || p.status) === 'completed').length;
  const setupInProgressCount = setupDrafts.length;

  const totalValue = finalizedProjects.reduce((sum, p) => sum + (p.acceptedQuotationValue || p.currentBOQValue || p.budgetBaseline || 0), 0);

  const cards = [
    {
      title: 'Total Projects',
      value: totalCount,
      subtitle: `${activeCount} Active execution`,
      icon: Briefcase,
      color: 'border-l-4 border-l-[#AB9570] bg-white',
      iconColor: 'text-[#AB9570] bg-[#AB9570]/10',
    },
    {
      title: 'Setups In Progress',
      value: setupInProgressCount,
      subtitle: 'Wizard Setup Drafts',
      icon: Clock,
      color: 'border-l-4 border-l-indigo-500 bg-white',
      iconColor: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Active Execution',
      value: activeCount,
      subtitle: 'Live Site Fitout',
      icon: PlayCircle,
      color: 'border-l-4 border-l-emerald-500 bg-white',
      iconColor: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'On Hold',
      value: onHoldCount,
      subtitle: 'Execution Paused',
      icon: PauseCircle,
      color: 'border-l-4 border-l-amber-500 bg-white',
      iconColor: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Completed',
      value: completedCount,
      subtitle: 'Handed Over to Client',
      icon: CheckCircle2,
      color: 'border-l-4 border-l-purple-500 bg-white',
      iconColor: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Total Contract Value',
      value: formatIndianCurrency(totalValue),
      subtitle: 'Accepted CRM Commercials',
      icon: TrendingUp,
      color: 'border-l-4 border-l-[#AB9570] bg-white',
      iconColor: 'text-[#AB9570] bg-[#AB9570]/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border border-slate-200 shadow-xs transition-all hover:shadow-md ${card.color}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight">{card.value}</div>
            <div className="text-[9px] text-slate-500 mt-0.5 font-medium truncate">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};

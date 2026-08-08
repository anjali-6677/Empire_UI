import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useERPStore } from '../../store/ERPStoreContext';
import { Project } from '../../domain/types';

import { ListPageLayout } from '../../components/common/ListPageLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { ProjectSummaryCards } from '../../components/projects/list/ProjectSummaryCards';
import { ProjectFiltersBar } from '../../components/projects/list/ProjectFiltersBar';
import { ProjectsTable } from '../../components/projects/list/ProjectsTable';
import { SelectTenderWonModal } from '../../components/projects/SelectTenderWonModal';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateCollection, addItem, updateItem } = useERPStore();

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');

  // Modal State
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

  // Available Cities
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    state.projects.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set).sort();
  }, [state.projects]);

  // Filtered Projects List
  const filteredProjects = useMemo(() => {
    return state.projects.filter((p) => {
      const status = (p.projectStatus || p.status || '').toLowerCase();
      if (status === 'draft_setup') return false;

      // Search
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchName = p.projectName?.toLowerCase().includes(term);
        const matchCode = p.projectCode?.toLowerCase().includes(term);
        const matchClient = p.clientName?.toLowerCase().includes(term);
        const matchCity = p.city?.toLowerCase().includes(term);
        if (!matchName && !matchCode && !matchClient && !matchCity) return false;
      }

      // Status
      if (statusFilter !== 'all' && p.status !== statusFilter && p.projectStatus !== statusFilter) return false;

      // City
      if (cityFilter !== 'all' && p.city !== cityFilter) return false;

      return true;
    });
  }, [state.projects, searchTerm, statusFilter, cityFilter]);

  const handleDuplicateProject = (projectId: string) => {
    const target = state.projects.find((p) => p.id === projectId);
    if (!target) return;

    const nextCode = `PRJ-2026-${String(state.projects.length + 1).padStart(3, '0')}`;
    const duplicated: Project = {
      ...target,
      id: `proj-${Date.now()}`,
      projectCode: nextCode,
      projectName: `${target.projectName} (Duplicate)`,
      status: 'draft',
      projectStatus: 'draft',
      boqStatus: 'approved',
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem('projects', duplicated);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      updateCollection('projects', state.projects.filter((p) => p.id !== projectId));
    }
  };

  const handleUpdateStatus = (projectId: string, newStatus: Project['status']) => {
    updateItem('projects', projectId, { status: newStatus, projectStatus: newStatus, updatedAt: new Date().toISOString() });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCityFilter('all');
  };

  return (
    <ListPageLayout>
      {/* Page Header */}
      <PageHeader
        title="Projects Directory & Control Center"
        subtitle="Unified management of fitout projects, accepted commercial baselines, and execution control."
        breadcrumbs={[
          { label: 'ERP Master' },
          { label: 'Projects Directory' }
        ]}
        actions={
          <button
            type="button"
            onClick={() => setIsSelectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#AB9570] hover:bg-[#927D5E] text-slate-950 font-bold rounded-xl shadow-xs transition-all text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Create Project
          </button>
        }
      />

      {/* Metric Summary Cards */}
      <ProjectSummaryCards projects={state.projects} />

      {/* Filter Toolbar */}
      <ProjectFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        cityFilter={cityFilter}
        onCityFilterChange={setCityFilter}
        availableCities={availableCities}
        onResetFilters={handleResetFilters}
      />

      {/* Projects Data Table */}
      <ProjectsTable
        projects={filteredProjects}
        onUpdateStatus={handleUpdateStatus}
        onDuplicate={handleDuplicateProject}
        onDelete={handleDeleteProject}
      />

      {/* Select Tender Won Opportunity Modal */}
      <SelectTenderWonModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        onSelectOpportunity={({ sourceEstimateRevisionId, draftId }) => {
          if (draftId) {
            navigate(`/projects/new?draftId=${draftId}`);
          } else {
            navigate(`/projects/new?sourceEstimateRevisionId=${sourceEstimateRevisionId}`);
          }
        }}
      />
    </ListPageLayout>
  );
};

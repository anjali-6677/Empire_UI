/**
 * Global Active Project Context for Empire Interior ERP
 * Location: src/context/ProjectContext.tsx
 */

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useERPStore } from '../store/ERPStoreContext';
import { Project } from '../domain/types';

interface ProjectContextValue {
  projects: Project[];
  selectedProjectId: string; // 'all' or projectId e.g. 'PRJ-2026-001'
  selectedProject: Project | null;
  setSelectedProjectId: (projectId: string) => void;
  activeProjectCode: string;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state } = useERPStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('PRJ-2026-001');

  const selectedProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return state.projects.find((p) => p.id === selectedProjectId || p.projectCode === selectedProjectId) || state.projects[0] || null;
  }, [state.projects, selectedProjectId]);

  const activeProjectCode = selectedProject ? selectedProject.projectCode : 'All Projects';

  return (
    <ProjectContext.Provider
      value={{
        projects: state.projects,
        selectedProjectId,
        selectedProject,
        setSelectedProjectId,
        activeProjectCode,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

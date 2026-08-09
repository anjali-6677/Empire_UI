import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MaterialIndentListPage } from './MaterialIndentListPage';

export const CreateMaterialIndentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;

  return (
    <MaterialIndentListPage
      initialCreateModalOpen={true}
      initialProjectId={projectId}
      onModalClose={() => navigate('/procurement/indents')}
    />
  );
};

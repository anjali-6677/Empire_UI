import * as React from 'react';
import { AppRouter } from './router';
import { SitesProvider } from './context/SitesContext';
import { ERPStoreProvider } from './store/ERPStoreContext';

import { ProjectProvider } from './context/ProjectContext';

export const App: React.FC = () => {
  return (
    <ERPStoreProvider>
      <ProjectProvider>
        <SitesProvider>
          <AppRouter />
        </SitesProvider>
      </ProjectProvider>
    </ERPStoreProvider>
  );
};

export default App;

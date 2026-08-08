import * as React from 'react';
import { AppRouter } from './router';
import { SitesProvider } from './context/SitesContext';
import { ERPStoreProvider } from './store/ERPStoreContext';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ERPStoreProvider>
        <ProjectProvider>
          <SitesProvider>
            <AppRouter />
          </SitesProvider>
        </ProjectProvider>
      </ERPStoreProvider>
    </AuthProvider>
  );
};

export default App;

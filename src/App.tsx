import * as React from 'react';
import { AppRouter } from './router';
import { SitesProvider } from './context/SitesContext';

export const App: React.FC = () => {
  return (
    <SitesProvider>
      <AppRouter />
    </SitesProvider>
  );
};
export default App;

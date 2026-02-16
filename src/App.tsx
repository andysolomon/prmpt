import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/layout';
import { migrateLegacyPromptStorageIfNeeded, seedDefaultExampleSkillsIfMissing } from './lib/library';
import { LibraryDashboardPage } from './features/library/LibraryDashboardPage';
import { PromptDetailPage } from './features/library/PromptDetailPage';
import { PromptsListPage } from './features/library/PromptsListPage';
import { AnatomiesListPage } from './features/library/AnatomiesListPage';
import { SkillsListPage } from './features/library/SkillsListPage';
import { SkillDetailPage } from './features/library/SkillDetailPage';
import { CreateSkillRoute } from './features/library/CreateSkillRoute';
import { PromptBuilderRoutePage } from './features/prompt/PromptBuilderRoutePage';
import { UiBuilderLandingPage } from './features/ui-builder/UiBuilderLandingPage';
import { UiBuilderScaffoldPage } from './features/ui-builder/UiBuilderScaffoldPage';
import { AnatomyRoutePage } from './features/anatomy/AnatomyRoutePage';
import { AdminStoragePage } from './features/admin/AdminStoragePage';
import { NotificationsProvider } from './components/ui/notifications';

function App() {
  useEffect(() => {
    migrateLegacyPromptStorageIfNeeded();
    seedDefaultExampleSkillsIfMissing();
  }, []);

  return (
    <NotificationsProvider>
      <Layout>
        <div className="mx-auto max-w-[1400px]">
          <Routes>
            <Route path="/" element={<Navigate to="/library" replace />} />
            <Route path="/library" element={<LibraryDashboardPage />} />
            <Route path="/library/prompts" element={<PromptsListPage />} />
            <Route path="/library/prompts/:id" element={<PromptDetailPage />} />
            <Route path="/library/anatomies" element={<AnatomiesListPage />} />
            <Route path="/library/skills" element={<SkillsListPage />} />
            <Route path="/library/skills/:id" element={<SkillDetailPage />} />
            <Route path="/create/skill" element={<CreateSkillRoute />} />
            <Route path="/create/prompt" element={<PromptBuilderRoutePage />} />
            <Route path="/anatomy" element={<AnatomyRoutePage />} />
            <Route path="/admin/storage" element={<AdminStoragePage />} />
            <Route path="/create/ui" element={<UiBuilderLandingPage />} />
            <Route path="/create/ui/:builderType" element={<UiBuilderScaffoldPage />} />
            <Route path="*" element={<Navigate to="/library" replace />} />
          </Routes>
        </div>
      </Layout>
    </NotificationsProvider>
  );
}

export default App;

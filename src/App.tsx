import Layout from './components/layout';
import { PromptBuilderPage } from './components/prompt-builder';

function App() {
  return (
    <Layout>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Prompt Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Build structured prompts with a wizard, live exports, and lint feedback.
          </p>
        </div>
        <PromptBuilderPage />
      </div>
    </Layout>
  );
}

export default App;

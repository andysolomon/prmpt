import React from 'react';
import Layout from './components/layout';
import PromptBuilder from './components/prompt-builder';

function App() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Chat-Based Prompt Builder</h1>
          <p className="text-muted-foreground mt-2">
            Create structured prompts through guided conversation
          </p>
        </div>
        <PromptBuilder />
      </div>
    </Layout>
  );
}

export default App;
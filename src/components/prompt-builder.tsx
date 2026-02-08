import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ChevronDown, Plus, Play, Save, Copy, Download } from 'lucide-react';

// Define types for our prompt structure
type PromptComponentType = 'instruction' | 'context' | 'example' | 'constraint' | 'output_format';

interface PromptComponent {
  id: string;
  type: PromptComponentType;
  label: string;
  content: string;
  required: boolean;
}

interface PromptStructure {
  title: string;
  description: string;
  components: PromptComponent[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    templateId?: string;
    tags: string[];
    author: string;
  };
}

const PromptBuilder: React.FC = () => {
  const [prompt, setPrompt] = useState<PromptStructure>({
    title: '',
    description: '',
    components: [],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      author: 'Current User',
    }
  });

  const [currentStep, setCurrentStep] = useState<'welcome' | 'template_selection' | 'gathering_details' | 'preview'>('welcome');

  const addComponent = (type: PromptComponentType) => {
    const newComponent: PromptComponent = {
      id: `comp-${Date.now()}`,
      type,
      label: getComponentLabel(type),
      content: '',
      required: false
    };

    setPrompt(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  const getComponentLabel = (type: PromptComponentType): string => {
    const labels: Record<PromptComponentType, string> = {
      instruction: 'Instruction',
      context: 'Context',
      example: 'Example',
      constraint: 'Constraint',
      output_format: 'Output Format'
    };
    return labels[type];
  };

  const updateComponent = (id: string, content: string) => {
    setPrompt(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === id ? { ...comp, content } : comp
      )
    }));
  };

  const removeComponent = (id: string) => {
    setPrompt(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id)
    }));
  };

  const generateMarkdown = (): string => {
    let markdown = `# ${prompt.title}\n\n`;
    markdown += `${prompt.description}\n\n`;

    for (const component of prompt.components) {
      markdown += `## ${component.label}\n\n`;
      markdown += `${component.content}\n\n`;
    }

    return markdown;
  };

  const handleSave = () => {
    // In a real app, this would save to Convex
    console.log('Saving prompt:', prompt);
    alert('Prompt saved successfully!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    alert('Prompt copied to clipboard!');
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateMarkdown()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${prompt.title || 'prompt'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Step */}
      {currentStep === 'welcome' && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Prompt Builder</CardTitle>
            <CardDescription>
              Create structured prompts through guided conversation or by adding components manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => setCurrentStep('gathering_details')} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Start from Scratch
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('template_selection')}
                className="flex items-center gap-2"
              >
                <ChevronDown className="h-4 w-4" /> Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Selection Step */}
      {currentStep === 'template_selection' && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Template</CardTitle>
            <CardDescription>
              Choose from pre-built templates to get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Salesforce Query', 'Code Review', 'Debugging Assistant', 'Documentation Generator'].map((template) => (
                <Card 
                  key={template} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setPrompt({
                      ...prompt,
                      title: template,
                      description: `A prompt template for ${template.toLowerCase()}`
                    });
                    setCurrentStep('gathering_details');
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{template}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
                Back to Start
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Building Step */}
      {(currentStep === 'gathering_details' || currentStep === 'preview') && (
        <div className="space-y-6">
          {/* Title and Description */}
          <Card>
            <CardHeader>
              <CardTitle>Prompt Details</CardTitle>
              <CardDescription>
                Give your prompt a title and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                <Input
                  id="title"
                  value={prompt.title}
                  onChange={(e) => setPrompt({...prompt, title: e.target.value})}
                  placeholder="Enter prompt title..."
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  id="description"
                  value={prompt.description}
                  onChange={(e) => setPrompt({...prompt, description: e.target.value})}
                  placeholder="Describe what this prompt is for..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Components Section */}
          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>
                Add and edit different parts of your prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Component
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addComponent('instruction')}>
                      Instruction
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent('context')}>
                      Context
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent('example')}>
                      Example
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent('constraint')}>
                      Constraint
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addComponent('output_format')}>
                      Output Format
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-4">
                {prompt.components.map((component) => (
                  <Card key={component.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{component.label}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeComponent(component.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={component.content}
                        onChange={(e) => updateComponent(component.id, e.target.value)}
                        placeholder={`Enter ${component.label.toLowerCase()}...`}
                        rows={4}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {prompt.components.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No components added yet. Click "Add Component" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={() => setCurrentStep('template_selection')}>
              Change Template
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button onClick={() => setCurrentStep('preview')}>
              <Play className="h-4 w-4 mr-2" /> Preview
            </Button>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {currentStep === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              This is how your prompt will look when exported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md border">
              <pre className="whitespace-pre-wrap break-words font-sans">
                {generateMarkdown()}
              </pre>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => setCurrentStep('gathering_details')}>
                Edit Prompt
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Save Final Prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptBuilder;
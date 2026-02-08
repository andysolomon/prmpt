# Prompt Builder for OpenClaw Skills

A toolkit for building, managing, and deploying dynamic prompts within the OpenClaw ecosystem, with special focus on enhancing agent skills and capabilities.

## Overview

This repository contains tools and templates for creating effective prompts that work seamlessly with OpenClaw's skill system. The prompt builder is designed to help create dynamic, context-aware prompts that can enhance agent capabilities, particularly for technical domains like Salesforce development.

## Tech Stack

- **React** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component library patterns
- **Bun** - Runtime
- **Vite** - Build tool
- **Convex** - Backend/database platform
- **Jest** - Testing framework

## Features

### Prompt Builder UI
- Interactive chat-based interface for creating prompts
- Support for different prompt components (instructions, context, examples, constraints, output formats)
- Template selection system
- Real-time preview of generated markdown
- Export functionality (copy to clipboard, download as markdown)

### Component Architecture
- Reusable UI components following ShadCN patterns
- State management for prompt building process
- Responsive design for various screen sizes

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

This project uses Vite for fast development. The development server runs on port 5173 by default.

## Architecture

### Component Structure
- `src/components/prompt-builder.tsx` - Main prompt building interface
- `src/components/layout.tsx` - Application layout
- `src/components/ui/` - Reusable UI components
- `src/lib/utils.ts` - Utility functions
- `src/styles/globals.css` - Global styles

### Key UI Components
- Button, Card, Input, Textarea - Basic form elements
- Dropdown Menu - For selecting prompt components
- Skeleton - Loading states

## Use Cases

### For Salesforce Development
- Dynamic SOQL query builders
- Apex code generation assistants
- Metadata management prompts
- Integration pattern templates

### For General Development
- Code review templates
- Architecture decision frameworks
- Debugging assistance prompts
- Documentation generators

## Contributing

This repository is designed to evolve with the OpenClaw ecosystem. Contributions that enhance the integration between prompts and skills are welcome.
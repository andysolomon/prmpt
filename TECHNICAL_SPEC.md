# Technical Specification: Chat-Based Prompt Builder

## Component Architecture

### 1. Core Components

#### PromptBuilderService
- Main orchestrator for the prompt building process
- Manages conversation state and progression
- Coordinates between different subsystems
- Handles validation and error management

#### ConversationStateManager
- Maintains current state of the conversation
- Tracks user progress through the prompt building flow
- Persists conversation context across messages
- Manages timeouts and session cleanup

#### PromptStructureAssembler
- Builds the prompt structure incrementally
- Validates components as they're added
- Manages template integration
- Ensures structural integrity of the final prompt

#### TemplateManager
- Loads and manages prompt templates
- Handles template customization
- Provides template metadata
- Manages template versioning

#### MarkdownFormatter
- Converts prompt structure to markdown format
- Applies styling and formatting rules
- Generates metadata documentation
- Ensures consistency across outputs

### 2. OpenClaw Integration Points

#### MessageHandler
- Intercepts messages directed to the prompt builder
- Routes messages to appropriate handlers
- Manages command recognition
- Processes natural language input

#### StatePersistence
- Integrates with OpenClaw's memory system
- Stores conversation state between interactions
- Manages session lifecycle
- Handles cleanup of completed sessions

#### ToolAccessLayer
- Provides safe access to OpenClaw tools when needed
- Implements security checks for sensitive operations
- Manages tool usage within the prompt building context

### 3. Data Models

#### PromptStructure
```javascript
{
  id: string,
  title: string,
  description: string,
  components: [
    {
      type: 'instruction'|'context'|'example'|'constraint'|'output_format',
      content: string,
      required: boolean,
      validated: boolean
    }
  ],
  metadata: {
    createdAt: Date,
    updatedAt: Date,
    templateId?: string,
    tags: string[],
    author: string
  }
}
```

#### ConversationState
```javascript
{
  sessionId: string,
  userId: string,
  currentState: 'welcome'|'template_selection'|'gathering_details'|'validating'|'generating'|'preview'|'completed',
  promptStructure: PromptStructure,
  currentQuestion: string,
  questionHistory: Array<{
    question: string,
    answer: string,
    timestamp: Date
  }>,
  context: {
    // Additional context variables
  },
  createdAt: Date,
  lastActiveAt: Date
}
```

#### TemplateDefinition
```javascript
{
  id: string,
  name: string,
  description: string,
  category: string,
  structure: [
    {
      id: string,
      label: string,
      type: 'text'|'textarea'|'select'|'multiselect',
      placeholder: string,
      required: boolean,
      defaultValue?: string,
      validation?: {
        regex?: string,
        minLength?: number,
        maxLength?: number,
        errorMessage?: string
      }
    }
  ],
  metadata: {
    author: string,
    version: string,
    createdAt: Date,
    updatedAt: Date
  }
}
```

### 4. API Specifications

#### Core Methods

##### startConversation(userId: string, options: StartOptions): Promise<ConversationState>
- Initializes a new prompt building session
- Sets initial state to 'welcome'
- Returns the initial conversation state

##### processMessage(conversationId: string, message: string): Promise<ConversationResponse>
- Processes a user message in the context of the current conversation
- Updates the conversation state
- Returns the system response and next state

##### selectTemplate(conversationId: string, templateId: string): Promise<boolean>
- Applies a template to the current prompt structure
- Updates the conversation state to reflect template selection
- Returns true if successful

##### updatePromptComponent(conversationId: string, componentId: string, value: string): Promise<boolean>
- Updates a specific component of the prompt structure
- Performs validation on the new value
- Returns true if successful

##### generateMarkdown(conversationId: string): Promise<string>
- Converts the current prompt structure to markdown format
- Applies formatting rules
- Returns the markdown string

### 5. Implementation Path

#### Week 1: Foundation
- Set up the basic skill structure
- Implement ConversationStateManager
- Create basic data models
- Set up state persistence

#### Week 2: Core Logic
- Implement PromptStructureAssembler
- Create TemplateManager with basic functionality
- Build validation system
- Set up message handling

#### Week 3: User Interaction
- Implement the main conversation flow
- Create question-answering mechanism
- Build template selection functionality
- Add error handling and recovery

#### Week 4: Output Generation
- Implement MarkdownFormatter
- Create preview functionality
- Build export options
- Add completion workflow

### 6. Security Considerations

#### Input Sanitization
- Sanitize all user inputs to prevent injection attacks
- Validate file paths to prevent directory traversal
- Limit size of inputs to prevent resource exhaustion

#### Access Controls
- Ensure only authorized users can access conversation data
- Implement proper session management
- Secure temporary file storage

#### Data Privacy
- Ensure prompt content remains private
- Implement proper data retention policies
- Secure deletion of temporary data

### 7. Performance Considerations

#### Memory Management
- Efficiently store conversation states
- Implement proper cleanup of old sessions
- Optimize data serialization/deserialization

#### Response Times
- Minimize latency in message processing
- Cache frequently used templates
- Optimize database queries

#### Scalability
- Design for concurrent users
- Implement proper locking mechanisms
- Consider distributed state management for high volume
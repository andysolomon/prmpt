# Diagrams for Prompt Builder

This document describes the Mermaid diagrams created to visualize the chat UI system that produces markdown files.

## Diagrams Included

### 1. chat-ui-flow.mmd
```mermaid
graph TD
    A[User] --> B[Chat Interface]
    B --> C{Input Type}
    C -->|Text Message| D[Process Natural Language]
    C -->|Commands| E[Execute Commands]
    C -->|Templates| F[Load Template]
    
    D --> G[Parse Intent]
    G --> H[Validate Input]
    H --> I{Valid?}
    I -->|Yes| J[Build Prompt Structure]
    I -->|No| K[Request Clarification]
    K --> B
    
    E --> L[Apply Settings]
    F --> M[Populate Template]
    
    J --> N[Format as Markdown]
    L --> N
    M --> N
    
    N --> O[Generate MD File]
    O --> P[Store/Export]
    P --> Q[Return to User]
    Q --> R[Review & Edit]
    R --> S{Satisfied?}
    S -->|Yes| T[Complete]
    S -->|No| U[Feedback Loop]
    U --> B
    
    style A fill:#e1f5fe
    style T fill:#e8f5e8
    style B fill:#fff3e0
    style N fill:#f3e5f5
    style O fill:#e8f5e8
```

This diagram shows the overall flow from user input to markdown generation, including validation loops and feedback mechanisms.

### 2. user-interaction-flow.mmd
```mermaid
sequenceDiagram
    participant User
    participant ChatUI as Chat UI
    participant Processor as Prompt Processor
    participant Generator as MD Generator
    
    User->>ChatUI: Start new prompt project
    ChatUI->>User: Welcome message & options
    User->>ChatUI: Select template or start from scratch
    alt Start from scratch
        ChatUI->>User: Ask for prompt purpose
        User->>ChatUI: Describe use case
        ChatUI->>Processor: Parse requirements
    else Use template
        ChatUI->>User: Show available templates
        User->>ChatUI: Select template
        ChatUI->>Processor: Load template
    end
    
    loop Gather prompt details
        ChatUI->>User: Ask specific questions
        User->>ChatUI: Provide details
        ChatUI->>Processor: Validate input
        alt Input invalid
            ChatUI->>User: Clarification request
            User->>ChatUI: Corrected input
        end
    end
    
    Processor->>Generator: Compile prompt structure
    Generator->>ChatUI: Return formatted markdown
    ChatUI->>User: Display generated markdown
    User->>ChatUI: Review and approve/edit
    alt Requires changes
        User->>ChatUI: Request modifications
        ChatUI->>Processor: Update structure
        Processor->>Generator: Regenerate
        Generator->>ChatUI: Return updated markdown
    end
    
    ChatUI->>User: Export options (save, copy, share)
    User->>ChatUI: Select export method
    ChatUI->>User: Complete markdown file
```

This sequence diagram details the step-by-step interactions between the user and the system during the prompt building process.

### 3. architecture.mmd
```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Chat Interface]
        B[Message Parser]
        C[State Manager]
    end
    
    subgraph "Processing Layer"
        D[Prompt Validator]
        E[Template Engine]
        F[Markdown Formatter]
    end
    
    subgraph "Data Layer"
        G[Templates DB]
        H[History Store]
        I[Export Module]
    end
    
    subgraph "External Services"
        J[OpenClaw API]
        K[AI Service]
    end
    
    A --> B
    A --> C
    B --> D
    B --> E
    D --> F
    E --> F
    F --> I
    E --> G
    C --> H
    A --> J
    D --> K
    E --> K
    
    style A fill:#cde4ff
    style D fill:#f0e6ff
    style F fill:#e6f7ff
    style I fill:#e6ffe6
```

This diagram illustrates the component architecture of the system, showing how different layers interact with each other.

### 4. data-flow.mmd
```mermaid
graph LR
    subgraph "Input Sources"
        A[User Messages]
        B[Template Requests]
        C[System Commands]
    end
    
    subgraph "Processing Pipeline"
        D[Message Parser]
        E[Intent Classifier]
        F[Context Handler]
        G[Validation Engine]
        H[Template Processor]
        I[Markdown Builder]
    end
    
    subgraph "Output Destinations"
        J[Real-time Preview]
        K[Markdown File]
        L[System Responses]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    G --> I
    H --> I
    I --> J
    I --> K
    I --> L
    L --> A
    
    style D fill:#e1f5fe
    style I fill:#e8f5e8
    style K fill:#f3e5f5
```

This diagram shows how data moves through the system from input sources to processing pipeline to output destinations.

### 5. user-journey.mmd
```
journey
    title User Journey for Chat-Based Prompt Builder
    
    section First Time User
        Discover the tool -> 3: User
        Learn basic commands -> 2: User
        Create first prompt -> 5: User, System
    
    section Experienced User
        Open tool -> 1: User
        Load existing template -> 3: User, System
        Customize prompt -> 4: User, System
        Generate markdown -> 2: System
        Export result -> 1: User
    
    section Power User
        Bulk operations -> 4: User, System
        Advanced customization -> 5: User, System
        Share templates -> 3: User, System
        Review analytics -> 2: User
```

This user journey map details the experience for different types of users (first-time, experienced, and power users).

### 6. conversation-states.mmd
```mermaid
stateDiagram-v2
    [*] --> Idle : Start session
    Idle --> PromptSelection : User initiates
    PromptSelection --> GatheringDetails : Choose custom or template
    GatheringDetails --> Validating : User provides details
    Validating --> GatheringDetails : Invalid input
    Validating --> Processing : Valid input
    Processing --> GeneratingMD : Build markdown
    GeneratingMD --> Preview : Show result
    Preview --> GatheringDetails : Request changes
    Preview --> Completed : Confirm result
    Completed --> [*]
    
    GatheringDetails --> Interrupted : Timeout
    Interrupted --> Idle : Resume
```

This state machine diagram shows the different states of the chat conversation flow and how the system transitions between them.

## Using These Diagrams

To view these diagrams visually:

1. Copy the Mermaid code from any of the sections above
2. Paste it into the [Mermaid Live Editor](https://mermaid.live/)
3. The diagram will render automatically

Alternatively, you can use any IDE or editor that supports Mermaid previews, or any of the various Mermaid plugins available for different platforms.
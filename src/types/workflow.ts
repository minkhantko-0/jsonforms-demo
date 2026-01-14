// Workflow Type Definitions

export interface Role {
  id: string;
  key: string;
  name: string;
}

export interface User {
  key: string;
  name: string;
  roles: string[];
}

export interface ParallelBranch {
  key: string;
  name: string;
  nodes: string[];
}

export interface WorkflowNode {
  key: string;
  description?: string;
  type:
    | 'start'
    | 'task'
    | 'decision'
    | 'service'
    | 'end'
    | 'parallel_gateway'
    | 'parallel_join';
  config?: NodeConfig;
  branches?: ParallelBranch[];
}

export interface SLAAction {
  name?: string;
  type: 'service' | 'escalate' | 'mutation';
  config: {
    type: string;
    method?: string;
    url?: string;
    body?: Record<string, unknown>;
    headers?: string;
    roles?: string[];
    toNode?: string;
  };
  condition?: {
    type: string;
    expression: string | null;
  };
}

export interface SLALevel {
  level: number;
  targetDuration: string;
  condition: {
    type: string;
    expression: string;
  };
  actions: SLAAction[];
}

export interface SLA {
  name: string;
  variant: 'node' | 'workflow';
  levels: SLALevel[];
}

export interface NodeConfig {
  type: 'assignment' | 'service';
  roles?: string[];
  groups?: string[];
  slas?: SLA[];
  payload?: ServicePayload;
  dependencies?: string[];
  condition?: {
    type: string;
    expression: string;
  };
}

export interface AssignmentPayload {
  type: 'role' | 'user';
  roles?: string[];
  users?: string[];
}

export interface ServicePayload {
  type: 'http';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface TransitionConfig {
  type: 'condition';
  payload?: {
    type: 'jexl';
    expression: string;
  };
  expression?: string;
}

export interface WorkflowTransition {
  fromNode: string;
  toNode: string;
  branch?: string;
  config?: TransitionConfig;
}

export interface Workflow {
  key: string;
  name: string;
  nodes: WorkflowNode[];
  transitions: WorkflowTransition[];
}

export interface WorkflowDefinition {
  workflowDefinitions: Workflow[];
}

export interface OldWorkflowDefinition {
  roles: Role[];
  users: User[];
  workflows: Workflow[];
}

// React Flow Node Data
export interface NodeData extends Record<string, unknown> {
  label: string;
  nodeKey: string;
  nodeType: WorkflowNode['type'];
  config?: NodeConfig;
  branches?: ParallelBranch[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export interface EdgeData extends Record<string, unknown> {
  condition?: string;
  branch?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

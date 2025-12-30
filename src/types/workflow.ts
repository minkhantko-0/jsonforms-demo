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

export interface WorkflowNode {
  key: string;
  type: 'start' | 'task' | 'decision' | 'service' | 'end';
  config?: NodeConfig;
}

export interface NodeConfig {
  type: 'assignment' | 'service';
  payload: AssignmentPayload | ServicePayload;
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
  payload: {
    type: 'jexl';
    expression: string;
  };
}

export interface WorkflowTransition {
  fromNode: string;
  toNode: string;
  config?: TransitionConfig;
}

export interface Workflow {
  key: string;
  name: string;
  nodes: WorkflowNode[];
  transitions: WorkflowTransition[];
}

export interface WorkflowDefinition {
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
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export interface EdgeData extends Record<string, unknown> {
  condition?: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

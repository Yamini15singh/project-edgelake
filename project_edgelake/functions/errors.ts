export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class ConfigurationError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', 500, details);
    this.name = 'ConfigurationError';
  }
}

export class ModelError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'MODEL_ERROR', 500, details);
    this.name = 'ModelError';
  }
}

export class ValidationError extends AIError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
} 
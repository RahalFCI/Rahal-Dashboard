export type ErrorTier = 'silent' | 'toast' | 'screen';

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'SERVER'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  | 'ALREADY_EXISTS'
  | 'LOCKED_OUT'
  | 'EMAIL_NOT_VERIFIED'
  | 'UNKNOWN';

const statusCodeMap: Record<number, ErrorCode> = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  422: 'VALIDATION_FAILED',
  429: 'RATE_LIMITED',
};

const backendStringCodeMap: Record<string, ErrorCode> = {
  InvalidRequest: 'VALIDATION_FAILED',
  ValidationError: 'VALIDATION_FAILED',
  InvalidFormat: 'VALIDATION_FAILED',
  InvalidValue: 'VALIDATION_FAILED',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  NotFound: 'NOT_FOUND',
  AlreadyExists: 'ALREADY_EXISTS',
  Unauthorized: 'UNAUTHORIZED',
  LockedOut: 'LOCKED_OUT',
  Forbidden: 'FORBIDDEN',
  EmailNotVerified: 'EMAIL_NOT_VERIFIED',
  UnknownError: 'SERVER',
  DatabaseError: 'SERVER',
  ExternalServiceError: 'SERVER',
  Timeout: 'SERVER',
};

export const errorMap: Record<ErrorCode, { message: string; tier: ErrorTier }> = {
  UNAUTHORIZED: { message: 'Your session expired. Sign in again.', tier: 'silent' },
  VALIDATION_FAILED: { message: 'Check the highlighted fields and try again.', tier: 'toast' },
  RATE_LIMITED: { message: 'Too many requests. Please slow down.', tier: 'toast' },
  NETWORK: { message: 'Network request failed.', tier: 'toast' },
  SERVER: { message: 'The server could not complete this request.', tier: 'screen' },
  NOT_FOUND: { message: 'The requested record was not found.', tier: 'toast' },
  FORBIDDEN: { message: 'You do not have access to this action.', tier: 'toast' },
  INVALID_CREDENTIALS: { message: 'Invalid email or password.', tier: 'screen' },
  ALREADY_EXISTS: { message: 'A matching record already exists.', tier: 'screen' },
  LOCKED_OUT: { message: 'This account is locked.', tier: 'screen' },
  EMAIL_NOT_VERIFIED: { message: 'This account email is not verified.', tier: 'screen' },
  UNKNOWN: { message: 'Something went wrong.', tier: 'screen' },
};

export function resolveErrorCode(status: number, backendCode?: number | string): ErrorCode {
  if (typeof backendCode === 'string' && backendCode in backendStringCodeMap) {
    return backendStringCodeMap[backendCode];
  }

  if (typeof backendCode === 'number') {
    if (backendCode === 42203) return 'INVALID_CREDENTIALS';
    if (backendCode === 40901) return 'ALREADY_EXISTS';
    if (backendCode >= 50000) return 'SERVER';
  }

  if (status in statusCodeMap) return statusCodeMap[status];
  if (status >= 500) return 'SERVER';
  return 'UNKNOWN';
}

export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  tier: ErrorTier;

  constructor(code: ErrorCode, status: number, message = errorMap[code].message) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.tier = errorMap[code].tier;
  }
}

export class ApiValidationError extends ApiError {
  fieldErrors: { property: string; message: string }[];

  constructor(fieldErrors: { property: string; message: string }[]) {
    super('VALIDATION_FAILED', 400);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}

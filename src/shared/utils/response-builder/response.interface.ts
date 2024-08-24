export type Tmeta = {
  timestamp: string;
  request_id: string;
  response_code: number;
  response_time: number;
  url: string;
  method: string;
  rate_limit_remaining: number;
  rate_limit_reset: number;
};

export type TerrorIssue = {
  field?: string;
  message: string;
};

export type ErrorDetail = {
  code: number;
  name: string;
  message: string;
  details: any;
  issues: TerrorIssue[];
  severity: 'warning' | 'error' | 'critical';
  type: 'validation' | 'authorization' | 'system' | 'http' | 'prisma';
  timestamp: string;
};

export type Twarning = {
  name: string;
  message: string;
};

export type Taccess = {
  token?: string;
  otpToken?: string;
  sessionExpired?: boolean;
  verificationRequired?: boolean;
};
export type ResponseFormat<T> = {
  success: boolean;
  message: string;
  meta: Tmeta;
  data: T;
  errors: ErrorDetail[];
  warnings?: any[];
  access: Taccess;
};

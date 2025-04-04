export interface LogData {
  action: string;
  entity: string;
  entityId?: number | string;
  userId?: number;
  details?: any;
  status: 'success' | 'error';
  errorMessage?: string;
}

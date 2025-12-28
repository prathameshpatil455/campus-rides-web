import { HttpErrorResponse } from '@angular/common/http';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof HttpErrorResponse) {
    if (error.error?.message) {
      return error.error.message;
    }
    
    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    }
    
    if (error.status === 401) {
      return 'Unauthorized. Please login again.';
    }
    
    if (error.status === 403) {
      return 'Access forbidden.';
    }
    
    if (error.status === 404) {
      return 'Resource not found.';
    }
    
    if (error.status === 500) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || `Error ${error.status}: ${error.statusText}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
};


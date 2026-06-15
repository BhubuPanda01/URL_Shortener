import { Request } from 'express';

export interface ShortenUrlRequest {
  url: string;
  customCode?: string;
}

export interface AnalyticsClick {
  clickedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface AnalyticsByDate {
  date: string;
  count: number;
}

export interface AnalyticsResponse {
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  totalClicks: number;
  clicksByDate: AnalyticsByDate[];
  recentClicks: AnalyticsClick[];
}

export interface ErrorResponse {
  success: boolean;
  error: string;
  code: string;
  retryAfter?: number;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

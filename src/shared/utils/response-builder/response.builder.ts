import { Injectable, Scope } from '@nestjs/common';
import {
  ErrorDetail,
  ResponseFormat,
  Taccess,
  Tmeta,
  Twarning,
} from 'src/shared/utils/response-builder/response.interface';

@Injectable({ scope: Scope.REQUEST })
export class ResponseBuilder<T> {
  private success: boolean;
  private message: string;
  private meta: Tmeta;
  private data: T;
  private errors: ErrorDetail[];
  private warnings: Twarning[];
  private access: Taccess;

  constructor() {
    this.success = true;
    this.message = '';
    this.meta = {
      timestamp: new Date().toISOString(),
      request_id: '',
      response_code: 200,
      response_time: 0,
      rate_limit_remaining: 10,
      rate_limit_reset: Date.now() + 3600 * 1000,
      url: '', // Initialize the `url` field
      method: '', // Initialize the `method` field
    };
    this.data = null as unknown as T;
    this.errors = [];
    this.warnings = [];
    this.access = {
      sessionExpired: false,
    };
  }

  get getMeta() {
    return this.meta;
  }
  get refreshToken() {
    return this.access.refreshToken;
  }

  setSuccess(success: boolean): this {
    this.success = success;
    return this;
  }

  setMessage(message: string): this {
    this.message = message;
    return this;
  }

  setMeta(meta: Partial<Tmeta>): this {
    this.meta = { ...this.meta, ...meta };
    return this;
  }

  setData(data: T): this {
    this.data = data;
    return this;
  }

  addError(error: ErrorDetail): this {
    this.errors.push(error);
    return this;
  }

  addWarning(warning: Twarning): this {
    this.warnings.push(warning);
    return this;
  }

  setToken(token: string): this {
    this.access.token = token;
    return this;
  }

  setRefreshToken(token: string): this {
    this.access.refreshToken = token;
    return this;
  }

  setOtpToken(token: string): this {
    this.access.otpToken = token;
    return this;
  }

  setSessionExpierity(hasExpired: boolean): this {
    this.access.sessionExpired = hasExpired;
    return this;
  }

  setVerificationRequired(required: boolean): this {
    this.access.verificationRequired = required;
    return this;
  }

  setRequestDetails(url: string, method: string): this {
    this.meta.url = url;
    this.meta.method = method;
    return this;
  }

  build(): ResponseFormat<T> {
    delete this.access.refreshToken;
    return {
      success: this.success,
      message: this.message,
      meta: this.meta,
      data: this.data,
      errors: this.errors,
      warnings: this.warnings,
      access: this.access,
    };
  }
}

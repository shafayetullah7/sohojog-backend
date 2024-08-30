import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { EnvConfigService } from 'src/env-config/env.config.service';

@Injectable()
export class EmailVerificationService {
  private readonly apiUrl = 'https://api.quickemailverification.com/v1/verify';
  private readonly apiKey: string;

  constructor(private readonly envConfig: EnvConfigService) {
    this.apiKey = this.envConfig.qevApi;
  }

  async verifyEmail(email: string): Promise<any> {
    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          email,
          apikey: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to verify email');
    }
  }
}

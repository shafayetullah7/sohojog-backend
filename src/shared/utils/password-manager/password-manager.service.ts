import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EnvConfigService } from 'src/env-config/env.config.service';

@Injectable()
export class PasswordManagerService {
  private salt: number;
  constructor(config: EnvConfigService) {
    this.salt = config.bcryptSaltRound;
  }

  async hashPassword(plainText: string): Promise<string> {
    const hashedText = await bcrypt.hash(plainText, this.salt);
    return hashedText;
  }

  async matchPassword(plainText: string, hashedText: string): Promise<boolean> {
    const match = await bcrypt.compare(plainText, hashedText);
    return match;
  }
}

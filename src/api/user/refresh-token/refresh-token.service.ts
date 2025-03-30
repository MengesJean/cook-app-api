import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createRefreshToken(
    userId: number,
    expiresInDays = 7,
  ): Promise<RefreshToken> {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
      isRevoked: false,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async findTokenByValue(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });
  }

  async revokeToken(id: number): Promise<void> {
    await this.refreshTokenRepository.update(id, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }
}

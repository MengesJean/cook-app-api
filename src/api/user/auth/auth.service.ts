import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { User } from '../user.entity';
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterDto } from './auth.dto';
import { AuthHelper } from './auth.helper';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  @Inject(RefreshTokenService)
  private readonly refreshTokenService: RefreshTokenService;

  public async register(body: RegisterDto): Promise<User | never> {
    const { name, email, password }: RegisterDto = body;
    let user: User = await this.repository.findOne({ where: { email } });
    if (user) {
      throw new HttpException('Conflict', HttpStatus.CONFLICT);
    }
    user = new User();

    user.name = name;
    user.email = email;
    user.password = this.helper.encodePassword(password);

    return this.repository.save(user);
  }

  public async login(body: LoginDto): Promise<object | never> {
    const { email, password }: LoginDto = body;
    const user: User = await this.repository.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('No user found', HttpStatus.NOT_FOUND);
    }
    await this.repository.update(user.id, { lastLoginAt: new Date() });

    // Generate access token
    const accessToken = this.helper.generateAccessToken(user);

    // Generate refresh token
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  public async refreshToken(body: RefreshTokenDto): Promise<object | never> {
    const { refreshToken } = body;

    // Find the refresh token
    const refreshTokenEntity =
      await this.refreshTokenService.findTokenByValue(refreshToken);
    if (!refreshTokenEntity) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    // Check if token is expired
    if (new Date() > refreshTokenEntity.expiresAt) {
      await this.refreshTokenService.revokeToken(refreshTokenEntity.id);
      throw new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED);
    }

    // Revoke the current refresh token (one-time use)
    await this.refreshTokenService.revokeToken(refreshTokenEntity.id);

    // Get user and generate new tokens
    const user = refreshTokenEntity.user;
    await this.repository.update(user.id, { lastLoginAt: new Date() });

    // Generate new tokens
    const accessToken = this.helper.generateAccessToken(user);
    const newRefreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }

  public async logout(body: LogoutDto): Promise<boolean> {
    const { refreshToken } = body;

    // Find the refresh token
    const refreshTokenEntity =
      await this.refreshTokenService.findTokenByValue(refreshToken);

    // If token exists, revoke it
    if (refreshTokenEntity) {
      await this.refreshTokenService.revokeToken(refreshTokenEntity.id);
      // Also revoke all refresh tokens for this user (optional, for added security)
      await this.refreshTokenService.revokeAllUserTokens(
        refreshTokenEntity.userId,
      );
    }

    return true;
  }

  public async me(user: User) {
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}

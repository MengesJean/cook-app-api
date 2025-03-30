import { User } from '@/api/user/user.entity';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

@Injectable()
export class AuthHelper {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  private readonly jwt: JwtService;
  private readonly config: ConfigService;

  constructor(jwt: JwtService, config: ConfigService) {
    this.jwt = jwt;
    this.config = config;
  }

  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token, null);
  }

  public async validateUser(decoded: any): Promise<User> {
    return this.repository.findOne({ where: { id: decoded.id } });
  }

  public generateAccessToken(user: User): string {
    return this.jwt.sign(
      { id: user.id, email: user.email },
      {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES'),
      },
    );
  }

  public isPasswordValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  }

  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  public async validateAccessToken(token: string): Promise<boolean | never> {
    try {
      const decoded: unknown = this.jwt.verify(token, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
      });

      if (!decoded) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }

      const user: User = await this.validateUser(decoded);
      if (!user) {
        throw new UnauthorizedException();
      }

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException();
    }
  }
}

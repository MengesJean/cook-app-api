import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../user.entity';
import { LoginDto, LogoutDto, RefreshTokenDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  @Inject(AuthService)
  private readonly service: AuthService;

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  private register(@Body() body: RegisterDto): Promise<User | never> {
    return this.service.register(body);
  }

  @Post('login')
  private login(@Body() body: LoginDto): Promise<object | never> {
    return this.service.login(body);
  }

  @Post('refresh')
  private refresh(@Body() body: RefreshTokenDto): Promise<object | never> {
    return this.service.refreshToken(body);
  }

  @Post('logout')
  private logout(@Body() body: LogoutDto): Promise<boolean> {
    return this.service.logout(body);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  private me(@Req() { user }: Request) {
    return this.service.me(<User>user);
  }
}

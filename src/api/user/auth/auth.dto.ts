import { Trim } from 'class-sanitizer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Trim()
  @IsEmail()
  public readonly email: string;

  @IsString()
  @MinLength(3)
  public readonly password: string;

  @IsString()
  @IsOptional()
  public readonly name?: string;
}

export class LoginDto {
  @Trim()
  @IsEmail()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  public readonly refreshToken: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  public readonly refreshToken: string;
}

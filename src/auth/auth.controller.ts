import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthCredentialsDto,
  LoginCredentialsDto,
} from './dto/auth-credentials.dto';
import { createResponse } from 'src/utils/generic-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() authcredentialsDto: AuthCredentialsDto) {
    const user = await this.authService.signUp(authcredentialsDto);
    return createResponse('User registration successful', { user });
  }

  @Post('login')
  async login(@Body() loginCredentialsDto: LoginCredentialsDto) {
    const accessToken = await this.authService.signIn(loginCredentialsDto);
    return createResponse('User login successful', { accessToken });
  }
}

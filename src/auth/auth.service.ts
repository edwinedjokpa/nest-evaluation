import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  AuthCredentialsDto,
  LoginCredentialsDto,
} from './dto/auth-credentials.dto';
import { JwtPayload } from './interfaces/jwt.payload';
import { EmailJobData } from 'src/email/job-types';
import { EMAIL_QUEUE_NAME } from 'src/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectQueue(EMAIL_QUEUE_NAME)
    private readonly emailQueue: Queue<EmailJobData>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto) {
    const userExists = await this.getUserByEmail(authCredentialsDto.email);

    if (userExists) {
      throw new ConflictException('User with email already exists');
    }

    const hashedPassword = await bcrypt.hash(authCredentialsDto.password, 10);

    const user = this.userRepository.create({
      ...authCredentialsDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Add the email job to the email queue (for worker processing)
    await this.emailQueue.add('WelcomeEmail', {
      to: user.email,
      subject: 'Welcome',
      template: './welcome',
      context: {
        name: user.email,
        message: 'Welcome to our platform!',
        password: authCredentialsDto.password,
      },
    });

    return user;
  }

  async signIn(loginCredentialsDto: LoginCredentialsDto) {
    const { email, password } = loginCredentialsDto;

    // Check if a user with the provided email exists
    const userExists = await this.getUserByEmail(email);

    // If user doesn't exist or password doesn't match, throw an error
    if (
      !userExists ||
      !(await this.validatePassword(password, userExists.password))
    ) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = this.generateAccessToken(userExists);

    await this.emailQueue.add('NewLogin', {
      to: userExists.email,
      subject: 'New Login Detected',
      template: './login',
      context: {
        message:
          'We detected a new login to your account. If this was you, you can ignore this email. If not, please change your password immediately.',
      },
    });

    return accessToken;
  }

  // Other methods...

  private async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id: userId });
  }

  private async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      email: user.email,
      userId: user.id,
      type: 'user',
    };

    return this.jwtService.sign(payload);
  }
}

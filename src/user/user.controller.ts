import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserService } from './user.service';
import { RequestWithUserId } from 'src/auth/interfaces/request-user';
import { createResponse } from 'src/utils/generic-response';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('dashboard')
  async dashboard(@Req() req: RequestWithUserId) {
    const user = await this.userService.dashboard(req.user.id);
    return createResponse('User dashboard', { user });
  }
}

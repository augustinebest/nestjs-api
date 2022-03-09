import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JWTGuard } from '../auth/guard';

@UseGuards(JWTGuard)
@Controller('user')
export class UserController {
  @Get('profile')
  // profile(@Req() req: Request)
  profile(@GetUser() user: User) {
    console.log(user);
    return 'user info';
  }
}

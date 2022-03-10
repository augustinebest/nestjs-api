import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JWTGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JWTGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('profile')
  // profile(@Req() req: Request)
  profile(@GetUser('email') email: string) {
    return this.userService.getUser(email);
    // return user;
  }

  @Patch('profile')
  update(@GetUser('sub') userId: number, @Body() dto: EditUserDto) {
    try {
      return this.userService.updateProfile(userId, dto);
    } catch (error) {
      console.log(error);
    }
  }
}

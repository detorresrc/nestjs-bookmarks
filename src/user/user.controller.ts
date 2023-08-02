import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';


@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  me(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @GetUser('id') id: number) {

    return {
      email,
      id,
      user
    };
  }

  @UseGuards(JwtGuard)
  @Patch()
  editUser(
    @GetUser('id') userId: number,
    @Body() dto: EditUserDto
  ) {
    return this.userService.editUser(userId, dto);
  }
}

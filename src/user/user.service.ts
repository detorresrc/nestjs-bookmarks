import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prismaSvc: PrismaService){}

  async editUser(userId: number, editUserDto: EditUserDto) {
    const user = await this.prismaSvc.user.update({
      where: {
        id: userId
      },
      data: {
        ...editUserDto
      }
    });

    delete user.hash;
    return user;
  }
}

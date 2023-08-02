import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto, LoginDto } from "./dto";
import * as argon from 'argon2';
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{
  constructor(
    private prismaSvc: PrismaService,
    private jwtSvc: JwtService,
    private configSvc: ConfigService
  ){}

  async signin(dto: LoginDto){
    const user = await this.prismaSvc.user.findUnique({
      where: {
        email: dto.email
      }
    });
    if(!user){
      throw new ForbiddenException('Incorrect username or password!');
    }

    const isValidPassword = await argon.verify(user.hash, dto.password);

    if(!isValidPassword){
      throw new ForbiddenException('Incorrect username or password!');
    }

    return this.signToken(user.id, user.email);
  }

  async signup(dto: AuthDto){
    const hash = await argon.hash(dto.password);
    const user = await this.prismaSvc.user.create({
      data: {
        email: dto.email,
        hash: hash,
        firstName: dto.firstName,
        lastName: dto.lastName
      }
    });

    return this.signToken(user.id, user.email);
  }

  private async signToken(userId: number, email: string) : Promise<{access_token: string}> {
    const payload = {
      sub: userId,
      email
    };

    const token = await this.jwtSvc.signAsync(payload, {
      expiresIn: '60m',
      secret: this.configSvc.get('JWT_SECRET')
    });

    return {
      access_token: token
    };
  }
}
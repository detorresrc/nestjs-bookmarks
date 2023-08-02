import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, LoginDto } from "./dto";

@Controller('auth')
export class AuthController{
  constructor(
    private authSvc: AuthService
    ){}

  @Post('signup')
  signup(@Body() dto: AuthDto){
    return this.authSvc.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: LoginDto){
    return this.authSvc.signin(dto);
  }
}
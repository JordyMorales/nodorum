import { Body, Controller, ForbiddenException, HttpCode, Post } from '@nestjs/common';
import { AppLogger } from '../app.logger';
import { UserService } from '../user/user.service';
import { JwtDto } from './dto/jwt.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserBody } from '../user/interfaces/user.interface';
import { LoginUserDto, RegisterUserDto } from '../user/dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { loginSchema, registerSchema } from './validator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { Rcid } from 'src/shared/decorators/rcid.decorator';
import { logFormat } from 'src/shared';

@Controller('auth')
export class AuthController {
  private logger = new AppLogger('AuthController');

  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  public async login(
    @Body(new JoiValidationPipe(loginSchema)) loginUserDto: LoginUserDto,
    @Rcid() rcid: string,
  ): Promise<JwtDto> {
    const { user } = await this.userService.login(loginUserDto);
    this.logger.debug(logFormat(rcid, 'login', `user (${user.username}:${user.email})`, loginUserDto, null));

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      // TODO: maybe add other fields
    };

    const accessToken = this.authService.getAccessToken(payload);
    const refreshToken = await this.authService.getRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('register')
  @HttpCode(201)
  public async register(
    @Body(new JoiValidationPipe(registerSchema)) registerUserDto: RegisterUserDto,
    @Rcid() rcid: string,
  ): Promise<UserBody> {
    const { user } = await this.userService.register(registerUserDto, { rcid, user: null });
    this.logger.debug(
      logFormat(rcid, 'register', `user ${user.username}:${user.email} registering`, registerUserDto, null),
    );

    // TODO: send confirmation email to user

    return { user };
  }

  @Post('refresh-token')
  @HttpCode(200)
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Rcid() rcid: string): Promise<JwtDto> {
    const { refreshToken } = refreshTokenDto;
    this.logger.debug(logFormat(rcid, 'refresh', `token ${refreshToken}`, refreshTokenDto, null));

    if (!refreshToken) {
      throw new ForbiddenException();
    }

    return this.authService.refreshToken(refreshToken);
  }
}

import { Controller, Get, Param, Body, Put, Delete, UsePipes, UseGuards, Post } from '@nestjs/common';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { UserBody, FollowersBody } from './interfaces/user.interface';
import { updateSchema } from './validator';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { AuthGuard } from '../shared/guards/auth.guard';
import { User } from 'src/shared/decorators';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  async me(@User() user: JwtPayload): Promise<UserBody> {
    return this.userService.findOne(user.id);
  }

  @Get('/:userId')
  async findOne(@Param('userId') userId: number): Promise<UserBody> {
    return this.userService.findOne(userId);
  }

  @Put('/update')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(updateSchema))
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: JwtPayload): Promise<UserBody> {
    return this.userService.update(user.id, updateUserDto);
  }

  @Delete('/delete')
  @UseGuards(AuthGuard)
  async delete(@User() user: JwtPayload): Promise<{ message: string }> {
    return this.userService.delete(user.id);
  }

  @Get('/email/:email')
  async findOneByEmail(@Param('email') email: string): Promise<UserBody> {
    return this.userService.findOneByEmail(email);
  }

  @Get('/username/:username')
  async findOneByUsername(@Param('username') username: string): Promise<UserBody> {
    return this.userService.findOneByUsername(username);
  }

  @Post('/follow/:userToFollowId')
  async followAction(
    @Param('userToFollowId') userToFollowId: number,
    @User() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.userService.followAction(user.id, userToFollowId);
  }

  @Get('/followers/:userId')
  async getFollowers(@Param(':userId') userId: number): Promise<FollowersBody> {
    return this.userService.getFollowers(userId);
  }
}

import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { CreateBookmarkDto } from './dto';

@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkSvc: BookmarkService){}

  @UseGuards(JwtGuard)
  @Get()
  index(@GetUser('id') userId: number) {
    return this.bookmarkSvc.all(userId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  view(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number
  ) {
    return this.bookmarkSvc.get(userId, bookmarkId);
  }

  @UseGuards(JwtGuard)
  @Post()
  store(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto
    ) {
    return this.bookmarkSvc.store(userId, dto);
  }
}

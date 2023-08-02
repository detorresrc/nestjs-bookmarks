import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { Bookmark } from '@prisma/client';

@Injectable()
export class BookmarkService {
  constructor(
    private prismaSvc: PrismaService
  ){}

  async store(
    userId: number,
    dto: CreateBookmarkDto
  ): Promise<Bookmark> {
    const bookmark = await this.prismaSvc.bookmark.create({
      data: {
        userId,
        ...dto
      }
    });

    return bookmark;
  }

  async all(userId: number): Promise<Bookmark[]> {
    return await this.prismaSvc.bookmark.findMany({
      where: {
        userId
      }
    });
  }

  async get(
    userId: number,
    bookmarkId: number
  ): Promise<Bookmark> {
    return await this.prismaSvc.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId
      }
    });
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators';
import { JWTGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { createBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JWTGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  @Get()
  getBookmarks(@GetUser('sub') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Post('create')
  createBookmark(
    @GetUser('sub') userId: number,
    @Body() dto: createBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch(':id')
  updateBookmark(
    @GetUser('sub') userId: number,
    @Body() dto: EditBookmarkDto,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.updateBookmark(userId, bookmarkId, dto);
  }

  @Get(':id')
  getABookmark(
    @GetUser('sub') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getABookmark(userId, bookmarkId);
  }

  @Delete(':id')
  DeleteABookmark(
    @GetUser('sub') user: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.deleteABookmark(user, bookmarkId);
  }
}

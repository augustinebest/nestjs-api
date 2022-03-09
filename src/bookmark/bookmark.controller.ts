import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

  // @HttpCode(HttpStatus.OK)
  @Patch(':id')
  updateBookmark(
    @GetUser('sub') userId: number,
    @Body() dto: EditBookmarkDto,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.updateBookmark(userId, bookmarkId, dto);
  }
}

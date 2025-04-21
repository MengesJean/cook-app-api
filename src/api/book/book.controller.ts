import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../user/auth/auth.guard';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('book')
@UseInterceptors(ClassSerializerInterceptor)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.bookService.findAll(req.user, paginationDto);
  }
  @Get('public')
  findPublic() {
    return this.bookService.findPublic();
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req, @Param('id') id: string) {
    return this.bookService.findOne(+id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(+id, updateBookDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.bookService.remove(+id, req.user);
  }

  @Post(':id/recipe/:recipeId')
  @UseGuards(JwtAuthGuard)
  addRecipe(
    @Request() req,
    @Param('id') id: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.bookService.addRecipe(+id, +recipeId, req.user);
  }

  @Delete(':id/recipe/:recipeId')
  @UseGuards(JwtAuthGuard)
  removeRecipe(
    @Request() req,
    @Param('id') id: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.bookService.removeRecipe(+id, +recipeId, req.user);
  }
}

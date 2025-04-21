import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from '../recipe/entities/recipe.entity';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { Book } from './entities/book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Recipe])],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}

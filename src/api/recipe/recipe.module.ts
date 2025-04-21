import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../book/entities/book.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, Book])],
  controllers: [RecipeController],
  providers: [RecipeService],
})
export class RecipeModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../book/entities/book.entity';
import { IngredientModule } from '../ingredient/ingredient.module';
import { RecipeIngredient } from '../recipe-ingredient/entities/recipe-ingredient.entity';
import { Step } from '../step/entities/step.entity';
import { Recipe } from './entities/recipe.entity';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, Book, RecipeIngredient, Step]),
    IngredientModule,
  ],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}

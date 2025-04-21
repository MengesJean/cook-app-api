import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientModule } from '../ingredient/ingredient.module';
import { RecipeModule } from '../recipe/recipe.module';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipeIngredient]),
    IngredientModule,
    RecipeModule,
  ],
})
export class RecipeIngredientModule {}

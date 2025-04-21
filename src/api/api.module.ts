import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { RecipeIngredientModule } from './recipe-ingredient/recipe-ingredient.module';
import { RecipeModule } from './recipe/recipe.module';
import { StepModule } from './step/step.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    RecipeModule,
    BookModule,
    IngredientModule,
    RecipeIngredientModule,
    StepModule,
  ],
})
export class ApiModule {}

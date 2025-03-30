import { Module } from '@nestjs/common';
import { RecipeModule } from './recipe/recipe.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, RecipeModule],
})
export class ApiModule {}

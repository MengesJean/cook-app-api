import { Module } from '@nestjs/common';
import { BookModule } from './book/book.module';
import { RecipeModule } from './recipe/recipe.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, RecipeModule, BookModule],
})
export class ApiModule {}

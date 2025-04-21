import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeModule } from '../recipe/recipe.module';
import { Step } from './entities/step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Step]), RecipeModule],
})
export class StepModule {}

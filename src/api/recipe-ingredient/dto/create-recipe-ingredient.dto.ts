import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateRecipeIngredientDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  ingredient_id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  order: number;
}

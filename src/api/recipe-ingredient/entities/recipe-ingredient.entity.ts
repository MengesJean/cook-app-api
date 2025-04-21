import { Ingredient } from '@/api/ingredient/entities/ingredient.entity';
import { Recipe } from '@/api/recipe/entities/recipe.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class RecipeIngredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  public recipe: Recipe;

  @Column()
  public recipe_id: number;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients)
  @JoinColumn({ name: 'ingredient_id' })
  public ingredient: Ingredient;

  @Column()
  public ingredient_id: number;

  @Column({ type: 'float' })
  public quantity: number;

  @Column({ type: 'varchar' })
  public unit: string;

  @Column({ type: 'int' })
  public order: number;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt: Date;
}

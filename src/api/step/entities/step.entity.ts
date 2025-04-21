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
export class Step extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'text' })
  public content!: string;

  @Column({ type: 'int' })
  public order: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'recipe_id' })
  public recipe: Recipe;

  @Column()
  public recipe_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt: Date;
}

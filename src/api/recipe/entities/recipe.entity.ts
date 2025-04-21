import { Book } from '@/api/book/entities/book.entity';
import { RecipeIngredient } from '@/api/recipe-ingredient/entities/recipe-ingredient.entity';
import { Step } from '@/api/step/entities/step.entity';
import { User } from '@/api/user/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Recipe extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public title!: string;

  @Column({ type: 'text' })
  public description: string;

  @Column({ type: 'boolean', default: false })
  public isPublic: boolean;

  @ManyToOne(() => User, (user) => user.recipes)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column()
  public user_id: number;

  @ManyToMany(() => Book, (book) => book.recipes)
  public books: Book[];

  @OneToMany(
    () => RecipeIngredient,
    (recipeIngredient) => recipeIngredient.recipe,
    {
      cascade: true,
    },
  )
  public recipeIngredients: RecipeIngredient[];

  @OneToMany(() => Step, (step) => step.recipe, {
    cascade: true,
  })
  public steps: Step[];

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt: Date;
}

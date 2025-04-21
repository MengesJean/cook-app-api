import { Recipe } from '@/api/recipe/entities/recipe.entity';
import { User } from '@/api/user/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public title!: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @Column({ type: 'boolean', default: false })
  public isPublic: boolean;

  @ManyToOne(() => User, (user) => user.books)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column()
  public user_id: number;

  @ManyToMany(() => Recipe, (recipe) => recipe.books)
  @JoinTable({
    name: 'book_recipes',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'recipe_id',
      referencedColumnName: 'id',
    },
  })
  public recipes: Recipe[];

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt: Date;
}

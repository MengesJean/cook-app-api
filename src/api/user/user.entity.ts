import { Book } from '@/api/book/entities/book.entity';
import { Recipe } from '@/api/recipe/entities/recipe.entity';
import { RefreshToken } from '@/api/user/refresh-token/refresh-token.entity';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'varchar' })
  public email!: string;

  @Exclude()
  @Column({ type: 'varchar' })
  public password!: string;

  @Column({ type: 'varchar', nullable: true })
  public name: string | null;

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  public recipes: Recipe[];

  @OneToMany(() => Book, (book) => book.user)
  public books: Book[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  public refreshTokens: RefreshToken[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updatedAt: Date;

  @Column({ type: 'timestamp', default: null, nullable: true })
  public lastLoginAt: Date | null;
}

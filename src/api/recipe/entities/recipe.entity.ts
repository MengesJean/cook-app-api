import { User } from '@/api/user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public updatedAt: Date;
}

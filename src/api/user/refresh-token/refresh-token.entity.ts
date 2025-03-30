import { User } from '@/api/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  userId: number;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}

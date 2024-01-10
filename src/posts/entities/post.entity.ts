import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/users/entities/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.post)
  user: User;

  @Column({ type: 'varchar', nullable: true })
  picture: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @ManyToMany(() => User)
  @JoinTable()
  wholikes: User[];

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  newPost: Promise<User>;
}

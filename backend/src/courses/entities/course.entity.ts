// src/courses/course.entity.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentCourse, UserReviews } from '../interfaces/courses.interfaces';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  longDescription?: string;

  @Column({ nullable: true })
  image?: string;

  @Column()
  price: string;

  @Column({ type: 'simple-array', nullable: true })
  topics?: string[];

  @Column()
  category: string;

  @Column({ default: true })
  isSubtitled: boolean;

  @Column({ nullable: true })
  language?: string;

  @Column({ default: false })
  isNew: boolean;

  @Column({ type: 'simple-array', nullable: true })
  includes?: string[];

  @Column({ type: 'simple-array', nullable: true })
  requirements?: string[];

  @Column({ type: 'simple-array', nullable: true })
  whatYouWillLearn?: string[];

  @Column({ type: 'json', nullable: true })
  content?: ContentCourse[];

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviews: number;

  @Column({ type: 'json', nullable: true })
  userReviews?: UserReviews[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

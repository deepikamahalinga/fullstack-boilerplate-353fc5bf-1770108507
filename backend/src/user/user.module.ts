// user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
  ],
  exports: [UserService],
})
export class UserModule {}

// entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  @Index()
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;
}

// enums/user-role.enum.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter and 1 number'
  })
  password: string;
}

// dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

// interfaces/user.interface.ts
export interface IUser {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}
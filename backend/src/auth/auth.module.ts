import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { VerificationToken } from './entities/verificationToken.entity';
import { MailService } from '../mail/mail.service';
import { PasswordResetToken } from './entities/forgotPasswordToken.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,
    VerificationToken,
    PasswordResetToken
  ])
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}

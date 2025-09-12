import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { VerificationToken } from './entities/verificationToken.entity';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, VerificationToken])],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}

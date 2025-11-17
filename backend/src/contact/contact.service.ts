import { Injectable } from '@nestjs/common';
import { ContactEmailDTO } from './interfaces/email.interfaces';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ContactService {

    constructor(
        private readonly mailService: MailService,
    ) {}

    async sendContactEmail(body: ContactEmailDTO) {
        const { name, email, subject, message } = body;
        await this.mailService.sendContactEmail(name, email, subject, message);
        return { ok: true };
    }
}

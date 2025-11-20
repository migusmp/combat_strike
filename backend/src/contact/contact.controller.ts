import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import type { ContactEmailDTO } from './interfaces/email.interfaces';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('send')
  async contact(@Body() body: ContactEmailDTO) {
    if (!body.name || !body.email || !body.subject || !body.message) {
      throw new BadRequestException('Faltan campos obligatorios');
    }
    
    return await this.contactService.sendContactEmail(body);
  }
}

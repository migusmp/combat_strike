import { BadRequestException, Body, Controller } from '@nestjs/common';
import { ContactService } from './contact.service';
import type { ContactEmailDTO } from './interfaces/email.interfaces';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  private contact(@Body() body: ContactEmailDTO) {
    if (!body.name || !body.email || !body.subject || !body.message) {
      throw new BadRequestException('Faltan campos obligatorios');
    }
    
    return this.contactService.sendContactEmail(body);
  }
}

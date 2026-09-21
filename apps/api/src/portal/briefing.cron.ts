import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BriefingService } from './briefing.service';
import { horaActualMexico } from './briefing.utils';

@Injectable()
export class BriefingCron {
  private readonly logger = new Logger(BriefingCron.name);

  constructor(private briefingService: BriefingService) {}

  /** Cada hora en punto (CDMX) envía briefing a proveedores con esa hora configurada (default 07:00). */
  @Cron('0 * * * *', { timeZone: 'America/Mexico_City' })
  async enviarBriefingsProgramados() {
    const hora = horaActualMexico();
    try {
      await this.briefingService.runScheduledBriefings(hora);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error en cron de briefing (${hora}): ${detail}`);
    }
  }
}

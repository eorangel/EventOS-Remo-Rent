import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

@Injectable()
export class HtmlPdfService {
  private readonly logger = new Logger(HtmlPdfService.name);

  async fromHtml(html: string): Promise<Buffer> {
    try {
      const browser = await this.launchBrowser();
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load', timeout: 30_000 });
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
        });
        return Buffer.from(pdf);
      } finally {
        await browser.close();
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      this.logger.error(`No se pudo generar PDF: ${detail}`);
      throw new ServiceUnavailableException(
        'No se pudo generar el PDF del contrato. Intenta de nuevo en unos momentos.',
      );
    }
  }

  private async launchBrowser() {
    const isLinux = process.platform === 'linux';

    if (isLinux) {
      const [puppeteer, chromium] = await Promise.all([
        import('puppeteer-core'),
        import('@sparticuz/chromium'),
      ]);

      return puppeteer.default.launch({
        args: chromium.default.args,
        executablePath: await chromium.default.executablePath(),
        headless: true,
      });
    }

    const puppeteer = await import('puppeteer');
    return puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
}

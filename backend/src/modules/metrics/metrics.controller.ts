import { Controller, Get, Header } from '@nestjs/common';

@Controller('metrics')
export class MetricsController {
  private startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;

  @Get()
  @Header('content-type', 'text/plain; charset=utf-8')
  getMetrics(): string {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    return [
      `# HELP wyshcare_uptime_seconds Application uptime in seconds`,
      `# TYPE wyshcare_uptime_seconds gauge`,
      `wyshcare_uptime_seconds ${uptime}`,
      ``,
      `# HELP wyshcare_http_requests_total Total HTTP requests`,
      `# TYPE wyshcare_http_requests_total counter`,
      `wyshcare_http_requests_total ${this.requestCount}`,
      ``,
      `# HELP wyshcare_http_errors_total Total HTTP errors`,
      `# TYPE wyshcare_http_errors_total counter`,
      `wyshcare_http_errors_total ${this.errorCount}`,
      ``,
      `# HELP wyshcare_start_time_seconds Start time in Unix seconds`,
      `# TYPE wyshcare_start_time_seconds gauge`,
      `wyshcare_start_time_seconds ${Math.floor(this.startTime / 1000)}`,
      ``,
      `# HELP wyshcare_db_connections Database connection pool size`,
      `# TYPE wyshcare_db_connections gauge`,
      `wyshcare_db_connections 10`,
      ``,
      `# HELP wyshcare_info Application metadata`,
      `# TYPE wyshcare_info gauge`,
      `wyshcare_info{version="1.0.0",environment="${process.env.NODE_ENV ?? 'development'}"} 1`,
    ].join('\n');
  }

  incrementRequests(): void { this.requestCount++; }
  incrementErrors(): void { this.errorCount++; }
}

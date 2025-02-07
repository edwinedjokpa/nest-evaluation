import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

@Injectable()
export class PingService {
  @Cron(CronExpression.EVERY_10_MINUTES)
  handleCron() {
    console.log('Pinging app to keep it alive...');
    this.pingApp();
  }

  async pingApp() {
    try {
      await axios.get('https://nest-evaluation.onrender.com/');
      console.log('Ping successful!');
    } catch (error) {
      console.error('Error while pinging the app:', error);
    }
  }
}

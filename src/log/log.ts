import chalk from 'chalk';
import logUpdate from 'log-update';

export class Log {

   private output: any = {};
   private times: any = {};

   private startTime(name: string): void {
      this.times[name] = new Date();
   }

   private endTime(name: string): number {
      const startTime: Date = this.times[name];
      delete this.times[name];
      return (new Date().getMilliseconds() - startTime.getMilliseconds())
   }

   private appendLog(message: string): void {
      this.output['sdadas'] = (this.output ? `\n` : '') + message;
      logUpdate(this.output);
   }

   public info(message: string, name?: string) {
      this.appendLog(chalk.blue(message));
   }
   public endInfo(message: string, name: string) {
      // this.startTime(`connection-${connectionName}`);
      // this.info(`Connecting (name: ${connectionName})`);
      // log.info(`Connecting (${connection.name})`, `connection-${connection.name}`);
   }

   public warn(message: string, name?: string) {
      this.appendLog(chalk.yellow(message));
   }

   public error(message: string, name?: string) {
      this.appendLog(chalk.red(message));
   }

   public connection(connectionName: string) {
      this.startTime(`connection-${connectionName}`);
      this.info(`Connecting (name: ${connectionName})`);
   }

   public endConnection(connectionName: string) {
      const connectionTime: number = this.endTime(`connection-${connectionName}`);
      this.info(`Connected (name: ${connectionName}) - time: ${connectionTime}ms`);
   }

   public query(query: string) {

   }
}

export const log: Log = new Log();
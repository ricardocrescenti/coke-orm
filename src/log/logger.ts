import chalk from 'chalk';
import logUpdate from 'log-update';
import { SimpleMap } from '../common';
import { ConnectionLogStep } from './types/connection-log-step.type';

/**
 * Class responsible for printing CokeORM logs.
 */
export class Logger {

	public active: boolean;
	public storeOutput: boolean = true;

	private readonly frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
	private readonly startTimes: SimpleMap<number> = {};
	private readonly output: SimpleMap<string> = {};

	/**
	 * Default class constructor
	 * @param {boolean} active Indicates whether logging is active. (Default:
	 * true)
	 */
	constructor(active: boolean = true) {
		this.active = active;

		if (this.active) {
			console.log(chalk.red('🥤 CokeORM 🥤'));
		}
	}

	/**
	 * Print the log.
	 * @param {string} step Log step. (Used only on connection to record the
	 * current step)
	 * @param {string} message Log result message in step informed.
	 * @param {number} startTime Step start date.
	 */
	private printLog(step: string, message: string, startTime?: number): void {
		if (!this.active) return;

		if (this.storeOutput) {

			if (startTime) {
				this.startTimes[step] = startTime;
			}

			if (startTime) {

				let frameIndex = 0;
				const interval = setInterval(() => {

					if (!this.startTimes[step]) {
						clearTimeout(interval);
						return;
					}

					if (frameIndex == this.frames.length) {
						frameIndex = 0;
					}

					this.output[step] = `${this.frames[frameIndex++]} ${message}`;
					logUpdate(Object.values(this.output).join('\n'));

				}, 100);

			} else {

				this.output[step] = message;
				delete this.startTimes[step];
				logUpdate(Object.values(this.output).join('\n'));

			}

		} else {
			console.log(message);
		}
	}

	/**
	 * Register the start of the step.
	 * @param {ConnectionLogStep} step Step to be registered
	 */
	public start(step: ConnectionLogStep): void {
		this.printLog(step, `${chalk.blue(step)}`, Date.now());
	}

	/**
	 * Indicate that the step was completed successfully.
	 * @param {ConnectionLogStep} step Step completed successfully.
	 */
	public sucess(step: ConnectionLogStep): void {
		const currentTime: number = Date.now();
		this.printLog(step, chalk.green(`✔ ${step} - ${(currentTime - this.startTimes[step])}ms`));
	}

	// /**
	//  *
	//  * @param message
	//  * @param step
	//  */
	// public warn(message: string, step?: ConnectionLogStep): void {
	// 	this.printLog(step ?? message, `⚠ ${chalk.yellow(message)}`);
	// }

	// /**
	//  *
	//  * @param message
	//  * @param step
	//  */
	// public error(message: string, step?: ConnectionLogStep): void {
	// 	this.printLog(step ?? message, `❌ ${chalk.red(message)}`);
	// }
}

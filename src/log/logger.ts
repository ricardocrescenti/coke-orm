import chalk from 'chalk';
import logUpdate from 'log-update';
import { SimpleMap } from '../common';
import { ConnectionLogStep as LoggerStep } from './types/connection-log-step.type';

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

			delete this.startTimes[step];

			if (this.storeOutput) {
				this.output[step] = message;
				logUpdate(Object.values(this.output).join('\n'));
			} else {
				console.log(message);
			}

		}
	}

	/**
	 * Register the start of the step.
	 * @param {LoggerStep} step Step to be registered
	 * @param {string} message Log message.
	 */
	public start(step: LoggerStep, message?: string): void {
		this.printLog(step, `${chalk.blue(message ?? step)}`, Date.now());
	}

	/**
	 * Indicate that the step was completed successfully.
	 * @param {LoggerStep} step Step completed successfully.
	 * @param {string} message Log message.
	 */
	public sucess(step: LoggerStep, message?: string): void {
		const currentTime: number = Date.now();
		this.printLog(step, chalk.green(`✅ ${message ?? step} - ${(currentTime - this.startTimes[step])}ms`));
	}

	/**
	 * Indicate that there was an error in step.
	 * @param {LoggerStep} step Step completed successfully.
	 * @param {string} message Log message.
	 */
	public error(step: LoggerStep, message?: string): void {
		this.printLog(step, `❌ ${chalk.red(message?? step)}`);
	}
}

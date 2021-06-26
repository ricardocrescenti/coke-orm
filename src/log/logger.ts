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

	// private readonly startTimes: SimpleMap<number> = {};
	private steps: SimpleMap<LogStep> = {};
	private stepsCount: number = 0;
	private interval?: NodeJS.Timeout;

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
	 * Register the start of the step.
	 * @param {LoggerStep} step Step to be registered
	 * @param {string} message Log message.
	 */
	public start(step: LoggerStep, message?: string): void {
		if (!this.active) return;

		if (step === 'Query') {

			if (this.interval != undefined) {
				return;
			}

			message = `${step}: ${message}`;

		}

		let logStep: LogStep = this.steps[step];
		if (!logStep) {

			// create new step
			logStep = new LogStep(step, Date.now(), message ?? step);
			this.steps[step] = logStep;
			this.stepsCount++;

			// if its first step start print output interval
			if (!this.interval) {
				this.interval = setInterval(() => {

					if (this.interval && this.stepsCount == 0) {
						clearTimeout(this.interval);
						this.interval = undefined;
						return;
					}

					logUpdate(Object.values(this.steps).join('\n'));

				}, 100);
			}
		}
	}

	/**
	 *
	 * @param {LoggerStep} step
	 * @param {string} message
	 * @param {Function} color
	 */
	private finish(step: LoggerStep, message: string, color: Function): void {
		if (!this.active) return;

		const logStep: LogStep = this.steps[step];
		if (!logStep) return;

		logStep.message = color(message);
		logStep.endTime = Date.now();
		this.stepsCount--;

		if (this.stepsCount == 0) {
			logUpdate(Object.values(this.steps).join('\n'));
			logUpdate.done();
			this.steps = {};
		}
	}

	/**
	 * Prints information added to the step.
	 * @param {LoggerStep} step Step that will be inserted additional information.
	 * @param {string} message Information message to be printed.
	 */
	public info(step: LoggerStep, message: string): void {
		if (!this.active) return;

		const logStep: LogStep = this.steps[step];
		if (!logStep) return;

		this.steps[step].steps.push(chalk.blue(` → ${message}`));
	}

	/**
	 * Indicate that the step was completed successfully.
	 * @param {LoggerStep} step Step completed successfully.
	 * @param {string} message Log message.
	 */
	public sucess(step: LoggerStep, message?: string): void {
		if (!this.active) return;

		const logStep: LogStep = this.steps[step];
		if (!logStep) return;

		this.finish(step, `✅ ${message ?? logStep.message}`, chalk.green);
	}

	/**
	 * Indicate that there was an error in step.
	 * @param {LoggerStep} step Step completed successfully.
	 * @param {string} message Log message.
	 */
	public error(step: LoggerStep, message?: string): void {
		if (!this.active) return;

		const logStep: LogStep = this.steps[step];
		if (!logStep) return;

		this.finish(step, `❌ ${message?? logStep.message}`, chalk.red);
	}
}

/**
 *
 */
class LogStep {

	public step: LoggerStep;
	public startTime?: number;
	public endTime?: number;
	public message: string;
	public steps: string[];

	private frameIndex = 0;
	private readonly frames: string[] = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];


	/**
	 *
	 * @param {LoggerStep} step
	 * @param {number} startTime
	 * @param {string} message
	 */
	constructor(step: LoggerStep, startTime: number | undefined, message: string) {
		this.step = step;
		this.startTime = startTime;
		this.message = message;
		this.steps = [];

		const interval = setInterval(() => {

			this.frameIndex++;
			if (this.frameIndex == this.frames.length) {
				this.frameIndex = 0;
			}

			if (this.endTime) {
				clearInterval(interval);
			}

		});
	}

	/**
	 *
	 * @return {string}
	 */
	public toString(): string {

		const messages: string[] = [
			(this.startTime ? (this.endTime ? `` : this.frames[this.frameIndex] + ' ') : '') + this.message + (this.startTime && this.endTime ? ` - ${this.endTime - this.startTime}ms` : ''),
			...this.steps,
		];
		return messages.join('\n');

	}

}

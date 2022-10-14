import chalk from 'chalk';

const TEMPLATE = {
    debug: `${chalk.cyan('debug')} %s`,
    info: `${chalk.blue('info')} %s`,
    warn: `${chalk.yellow('warn')} %s`,
    error: `${chalk.red('error')} %s`,
};

const REQUIREMENTS = {
    debug: process.env.DEBUG === 'true',
    info: true,
    warn: true,
    error: true,
};

export default class Logger {
    static debug(message: string): void {
        if (!REQUIREMENTS.debug) return;

        console.log(TEMPLATE.debug, message);
    }

    static info(message: string): void {
        if (!REQUIREMENTS.info) return;

        console.log(TEMPLATE.info, message);
    }

    static warn(message: string): void {
        if (!REQUIREMENTS.warn) return;

        console.log(TEMPLATE.warn, message);
    }

    static error(message: string): void {
        if (!REQUIREMENTS.error) return;

        console.log(TEMPLATE.error, message);
    }

    static log(message: string): void {
        console.log(message);
    }
}

import ErrorDTO from '@common/dto/error.dto';
import * as assert from 'assert';
import InternalError from './internal-error';

export default class ErrorBinding {
    private readonly splittedMessage: string[];
    private readonly startWithSeparator: boolean;
    private readonly endsWithSeparator: boolean;
    private readonly messageParametersNbr: number;

    // eslint-disable-next-line max-params
    constructor(readonly code: string, readonly name: string, readonly message: string, private readonly messageSeparator: string) {
        this.splittedMessage = message.split(this.messageSeparator);
        this.startWithSeparator = message.startsWith(this.messageSeparator);
        this.endsWithSeparator = message.endsWith(this.messageSeparator);
        this.messageParametersNbr = (this.message.match(new RegExp(messageSeparator, 'g')) || []).length;
    }

    dto(message: string): ErrorDTO {
        return {
            code: this.code,
            name: this.name,
            message,
        };
    }

    generateErrorIf(condition: boolean) {
        return {
            overrideMessage: (message: string) => {
                const errorData = this.dto(message);
                if (condition) throw new InternalError(errorData);
            },
            formatMessage: (...args: string[]) => {
                const errorData = this.dto(this.getFormattedMessage(...args));
                if (condition) throw new InternalError(errorData);
            },
        };
    }

    getFormattedMessage(...args: string[]): string {
        assert(
            args.length === this.messageParametersNbr,
            `The message for error '${this.name}' has ${this.messageParametersNbr} placeholders, got ${args.length}.`,
        );
        let finalMessage = '';
        let i = 0;
        if (this.startWithSeparator) finalMessage += args[i++];
        for (let j = 0; i < args.length; i++, j++) finalMessage += this.splittedMessage.at(j) + args[i];
        if (!this.endsWithSeparator) finalMessage += this.splittedMessage.at(i);
        return finalMessage;
    }
}

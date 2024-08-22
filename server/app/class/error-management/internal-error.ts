import ErrorDTO from '@common/dto/error.dto';

export default class InternalError extends Error implements ErrorDTO {
    code: string;

    constructor(errorData: ErrorDTO) {
        super();
        this.code = errorData.code;
        this.name = errorData.name;
        this.message = errorData.message;
    }
}

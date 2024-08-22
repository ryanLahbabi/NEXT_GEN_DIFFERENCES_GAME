import ErrorBinding from './error-binding';

export default class ErrorTrigger {
    constructor(public triggerCode: number | string, public binding: ErrorBinding, public condition: boolean = true) {}
}

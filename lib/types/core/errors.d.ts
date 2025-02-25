import { ServerResponse } from 'node:http';
import { RequestErrorEnum } from '../types/index.js';
export declare class RequestErrors {
    private static readonly _statusCodes;
    private static readonly _messages;
    static throw(res: ServerResponse, type: RequestErrorEnum, customMessage?: string): void;
}
//# sourceMappingURL=errors.d.ts.map
import { AWSMessage } from './awsmessage';

export class AWSResponse {
    readonly location: string;
    readonly message: AWSMessage;
    readonly timestamp: Date;
}
export class AWSMessage {
    readonly filling: number;
}

export class AWSResponse {
    readonly location: string;
    readonly message: AWSMessage;
    readonly timestamp: string;
}
export interface Message {
    text: string;
    time: string;
    isMessageText: boolean;
    messageReceived: boolean;
    name?: string;
}

export interface MessagesMainPage {
    sender: string;
    message: any;
    timestamp: string;
    messageReceived: boolean;
    lobbyId: string;
    avatar: string;
}

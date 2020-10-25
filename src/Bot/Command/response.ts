import { Message, MessageOptions, StringResolvable, MessageAdditions, APIMessage } from "discord.js";
import { type } from "os";


export default class CommandResponse {
    private srcDmReply: replyDMFn;
    private srcMsgReply: MessageReplyFn;
    private srcChannelReply: ChannelReplyFn;
    private stack: MessageModifyLayer[];


    //saves source promises, on execute, he will do the things afterwards
    constructor(msg: Message) {
        this.srcMsgReply = (a: any, b?: any) => {
            if (b) return msg.reply(a, b)
            else return msg.reply(a)
        };
        this.srcChannelReply = (a: any, b?: any) => {
            if (b) return msg.channel.send(a, b)
            else return msg.channel.send(a)
        };
        //Wrapper that creates dm, before sending message
        this.srcDmReply = (a: any, b?: any) => msg.author.createDM().then((dms) => {
            if (b) return dms.send(a, b)
            else return dms.send(a);
        });
        this.stack = []
    }

    useModifier(...modifiers: MessageModifier[]): void
    useModifier(filter: ModifierFilter, ...modifiers: MessageModifier[]): void
    useModifier(s: ModifierFilter | MessageModifier, ...ms: MessageModifier[]) {
        let matcher: ModifierFilter = 'ALL';
        if (typeof s !== 'string')
            ms.unshift(s);
        else
            matcher = s;
        ms.forEach((m) => {
            this.stack.push(new MessageModifyLayer(m, matcher))
        })
    }

    msgReply(content: StringResolvable, options?: MessageOptions | MessageAdditions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message>;
    msgReply(options?:
        | MessageOptions
        | MessageAdditions
        | APIMessage
        | (MessageOptions & { split?: false })
        | MessageAdditions
        | APIMessage,
    ): Promise<Message>;
    msgReply(a: any, b?: any) {
        return this.handleReply('R', this.srcMsgReply(a, b))
    }

    dmReply(options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<Message>;
    dmReply(
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message>;
    dmReply(a: any, b?: any) {
        return this.handleReply('D', this.srcDmReply(a, b))
    }

    channelReply(content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message>;
    channelReply(options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<Message>
    channelReply(a: any, b?: any) {
        return this.handleReply('C', this.srcChannelReply(a, b));
    }


    private handleReply(s: 'D' | 'C' | 'R', firstPromise: Promise<Message>): Promise<Message> {
        return this.stack
            .filter((mml) => mml.matches(s))
            .reduce(async (prevPromise, mml) =>
                prevPromise.then((modified) => mml.modify(modified)), firstPromise)
    }
}



type ChannelReplyFn = {
    (content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message>;
    (options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<Message>
}

type MessageReplyFn = {
    (content?: StringResolvable,
        options?: MessageOptions | MessageAdditions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message>;
    (options?:
        | MessageOptions
        | MessageAdditions
        | APIMessage
        | (MessageOptions & { split?: false })
        | MessageAdditions
        | APIMessage,
    ): Promise<Message>;
}

type replyDMFn = {
    (options: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions | APIMessage,
    ): Promise<Message>;
    (
        content: StringResolvable,
        options?: MessageOptions | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message>;
}

class MessageModifyLayer {
    matches: Predicate<string>;
    modify: StrictMessageModifier
    constructor(f: MessageModifier, matcher: ModifierFilter | undefined) {
        if (matcher && matcher !== 'ALL')
            this.matches = (s) => matcher.includes(s)
        else
            this.matches = () => true;
        this.modify = (msg: Message) => {
            const retInner = f(msg); //Captures the return of modificator
            if (retInner instanceof Promise) { //If modificator infact returned a promise, await it, then proceed
                return retInner.then(() => Promise.resolve(msg))
            } else
                return Promise.resolve(msg)
        };
    }
}

type MessageModifier = {
    (msg: Message): Promise<any> | void;
};
type StrictMessageModifier = { (msg: Message): Promise<Message> }

//Which replies to modify
type ModifierFilter = 'D' | 'C' | 'R' | 'DC' | 'CR' | 'DR' | 'ALL'

type Predicate<T> = { (t: T): boolean }
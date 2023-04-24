import type { Message } from '../db/messages';

export function chunkMessagesArray(chunkSize: number, messages: Message[]): Message[][] {
    const sortedMessages = messages
        .slice()
        .sort((a, b) => a.created_at.localeCompare(b.created_at));

    const chunks: Message[][] = [];
    let currentChunk: Message[] = [];

    const authorMessages: { [authorId: string]: Message[] } = {};

    for (const message of sortedMessages) {
        const authorId = message.author_id;

        if (currentChunk.length === 0) {
            currentChunk.push(message);
            authorMessages[authorId] = [message];
            continue;
        }

        const lastMessage = currentChunk[currentChunk.length - 1];
        const lastAuthorId = lastMessage.author_id;

        if (authorId !== lastAuthorId) {
            chunks.push(currentChunk);
            currentChunk = [message];
            authorMessages[authorId] = [message];
            continue;
        }

        const lastTimestamp = new Date(lastMessage.created_at).getTime();
        const currentTimestamp = new Date(message.created_at).getTime();

        if (currentTimestamp - lastTimestamp > 60000) {
            chunks.push(currentChunk);
            currentChunk = [message];
            authorMessages[authorId] = [message];
            continue;
        }

        const authorMessagesForChunk = authorMessages[authorId];
        const lastMessageForAuthor = authorMessagesForChunk[authorMessagesForChunk.length - 1];
        const lastTimestampForAuthor = new Date(lastMessageForAuthor.created_at).getTime();

        if (currentTimestamp - lastTimestampForAuthor > 60000) {
            chunks.push(currentChunk);
            currentChunk = [message];
            authorMessages[authorId] = [message];
            continue;
        }

        currentChunk.push(message);
        authorMessagesForChunk.push(message);
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

export interface GroupedMessage {
    authorId: string;
    firstMessage: string;
    messages: { id: string; content: string; created_at: string }[];
}

export function groupMessagesByAuthor(chunks: Message[][]): GroupedMessage[] {
    return chunks.map((chunk) => {
        const authorId = chunk[0].author_id;
        const messages = chunk.map((message) => ({
            id: message.id,
            content: message.content,
            created_at: message.created_at
        }));
        return { authorId, messages, firstMessage: messages[0].created_at };
    });
}

export function groupMessages(messages: Message[]) {
    const chunks = chunkMessagesArray(2, messages);
    return groupMessagesByAuthor(chunks);
}

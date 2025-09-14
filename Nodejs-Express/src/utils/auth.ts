import { createHmac, randomBytes } from "crypto";

export const hashString = ({ str, salt }: { str: string, salt: string }): string => {
    return createHmac('sha256', salt).update(str).digest('hex');
}

export const generateRandomBytes = ({ length = 32 }: { length?: number }): string => {
    return randomBytes(length).toString('hex')
}
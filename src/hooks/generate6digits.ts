import crypto from 'crypto';

export const generateRandom6DigitNumber = () => {
    const randomNumber = crypto.randomInt(0, 99999);
    return randomNumber.toString().padStart(6, '0');
};

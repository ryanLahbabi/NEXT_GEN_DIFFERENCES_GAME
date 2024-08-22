import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';

export const DEFAULT_LANG = Language.French;
export const DEFAULT_THEME = Theme.Light;
export const DEFAULT_SUCCESS = './assets/success.mp3';
export const DEFAULT_FAILURE = './assets/error.wav';

export const SUCCESS_SOUNDS: { name: string; sound: string }[] = [
    { name: 'DEFAULT_SOUND', sound: './assets/success.mp3' },
    { name: 'BINGCHILLING_SOUND', sound: './assets/Bingchilling.mp3' },
    { name: 'GOAT_SOUND', sound: './assets/Goat.mp3' },
    { name: 'PERFECT_SOUND', sound: './assets/Perfect.mp3' },
];
export const FAILURE_SOUNDS: { name: string; sound: string }[] = [
    { name: 'DEFAULT_SOUND', sound: './assets/error.wav' },
    { name: 'BONK_SOUND', sound: './assets/CavemanBonk.mp3' },
    { name: 'HUH_SOUND', sound: './assets/Huh.mp3' },
    { name: 'BRUH_SOUND', sound: './assets/bruh.mp3' },
];

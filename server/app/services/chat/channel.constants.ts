import { GlobalActionType } from '@common/enums/channel/global-action-type.enum';
import { Language } from '@common/enums/user/language.enum';
type GetFormattedMessage = (...args: string[]) => string;
export type GetTranslationCallbacks = { [Language.English]: GetFormattedMessage; [Language.French]: GetFormattedMessage };

export const GLOBAL_CHANNEL_ID = '0';
export const GLOBAL_ACTION_MESSAGES: {
    [key: number]: GetTranslationCallbacks[];
} = {
    [GlobalActionType.MatchResult]: [
        {
            en: (winner: string) => `${winner} won`,
            fr: (winner: string) => `${winner} a gagné`,
        },
        {
            en: (winner: string) => `${winner} destroyed the competition`,
            fr: (winner: string) => `${winner} a détruit la compétition`,
        },
        {
            en: (winner: string) => `${winner} is savage`,
            fr: (winner: string) => `${winner} est sauvage`,
        },
    ],
    [GlobalActionType.RankUp]: [
        {
            en: (user: string) => `${user} ranked up!`,
            fr: (user: string) => `${user} a monté de rang!`,
        },
        {
            en: (user: string) => `${user} is ascending!`,
            fr: (user: string) => `${user} deviens un dieux!`,
        },
        {
            en: (user: string) => `${user} is better than the rest!`,
            fr: (user: string) => `${user} est meilleur que les autres!`,
        },
    ],
    [GlobalActionType.RankDown]: [
        {
            en: (user: string) => `${user} ranked down`,
            fr: (user: string) => `${user} est descendu de rang`,
        },
        {
            en: (user: string) => `${user} is a mortal again`,
            fr: (user: string) => `${user} est de retour parmi les mortels`,
        },
        {
            en: (user: string) => `${user} is useless`,
            fr: (user: string) => `${user} est inutile`,
        },
    ],
};

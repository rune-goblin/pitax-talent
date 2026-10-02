import { MODULE_ID } from './constants';

export const t = (key: string): string => game.i18n.localize(`${MODULE_ID}.${key}`);
export const tf = (key: string, data: Record<string, string>): string => game.i18n.format(`${MODULE_ID}.${key}`, data);

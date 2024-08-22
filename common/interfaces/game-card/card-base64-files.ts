import { DifferenceBase64Files } from './difference-base64-files';

export interface CardBase64Files {
    id: string;
    originalImage: string;
    modifiedImage: string;
    differencesBase64Files: DifferenceBase64Files[];
}

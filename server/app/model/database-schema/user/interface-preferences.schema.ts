import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InterfacePrefencesDocument = InterfacePrefences & Document;

@Schema({ _id: false })
export class InterfacePrefences {
    @Prop({ enum: Language, default: Language.French })
    language: Language;

    @Prop({ enum: Theme, default: Theme.Light })
    theme: Theme;
}
export const interfacePrefencesSchema = SchemaFactory.createForClass(InterfacePrefences);

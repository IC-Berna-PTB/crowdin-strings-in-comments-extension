export class ExtensionSettings {

    version: number = 1;
    clickBehavior: number = 1;
    preventPreFilter: BooleanishNumber = 1;
    defaultLanguage: string = "W10="; // empty array
    darkThemeHtml: BooleanishNumber = 0;
    allContentRedirect: BooleanishNumber = 1;
}

export type BooleanishNumber = 0 | 1;


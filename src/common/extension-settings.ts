export class ExtensionSettings {

    version: number = 1;
    clickBehavior: number = 1;
    preventPreFilter: BooleanishNumber = 1;
    defaultLanguage: string = "W10="; // empty array
    darkThemeHtml: BooleanishNumber = 0;
    allContentRedirect: BooleanishNumber = 1;
    naggedAboutDefaultLanguage: BooleanishNumber = 0;
    highlanderApproval: BooleanishNumber = 0;
    embiggenSubmit: BooleanishNumber = 1;
    submitColorEnabled: BooleanishNumber = 0;
    submitColorValue?: string = undefined;
    submitDisabledColorValue?: string = undefined;
}

export type BooleanishNumber = 0 | 1;


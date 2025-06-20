export class LanguageDefinition {
    genders: string[]
    plurals: string[]
}

export let langDef: Map<string, LanguageDefinition> = new Map()

langDef.set('en-ar', {
    'genders': ['m', 'f'],
    'plurals': [
        'is 1',
        'is 2',
        'everything else including all decimal numbers',
    ]
})
langDef.set('en-bg', {
    'genders': ['m', 'f', 'n'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-cs', {
    'genders': ['ma', 'f', 'mi', 'n'],
    'plurals': [
        'is 1',
        'is 2-4',
        'every other natural integer',
        'decimal numbers',
    ]
});
langDef.set('en-da', {
    'genders': ['n', 'c'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-nl', {
    'genders': [],
    'plurals': [
        'is 1 or decimal number in ]0;2[ with one \'1\' and any number of \'0\' as decimals',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-fi', {
    'genders': [],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-fr', {
    'genders': ['m', 'f'],
    'plurals': [
        'is within [0;2[ including decimal numbers',
        'everything else: [2;∞[ including decimal numbers',
    ]
});
langDef.set('en-de', {
    'genders': ['m', 'f', 'n'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-el', {
    'genders': ['m', 'f', 'n'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-hu', {
    'genders': [],
    'plurals': [
        'is 1 and any decimal number',
        'everything else',
    ]
});
langDef.set('en-id', {
    'genders': [],
    'plurals': [
        'everything including decimal numbers',
    ]
});
langDef.set('en-it', {
    'genders': ['m', 'f'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-ja', {
    'genders': [],
    'plurals': [
        'everything including decimal numbers',
    ]
});
langDef.set('en-ko', {
    'genders': [],
    'plurals': [
        'everything including decimal numbers',
    ]
});
langDef.set('en-no', {
    'genders': ['m', 'f', 'n'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-pl', {
    'genders': ['f', 'n', 'mp', 'ma', 'mi'],
    'plurals': [
        'is 1',
        'ends in 2-4, excluding 12-14',
        'every other natural integer',
        'all decimal numbers',
    ]
});
langDef.set('en-pt', {
    'genders': ['m', 'f'],
    'plurals': [
        'is 1 or 1.0',
        'everything else including all decimal numbers except 1.0',
    ]
});
langDef.set('en-ptbr', {
    'genders': ['m', 'f'],
    'plurals': [
        'is within [0;2[ including decimal numbers',
        'everything else: [2;∞[ including decimal numbers',
    ]
});
langDef.set('en-ro', {
    'genders': ['m', 'f'],
    'plurals': [
        'is 1',
        'is 0 or ends in 01-19, excluding 1',
        'everything else',
    ]
});
langDef.set('en-ru', {
    'genders': ['m', 'f', 'n'],
    'plurals': [
        'ends in 1, excluding 11',
        'ends in 2-4, excluding 12-14',
        'everything not covered by forms 0, 1, 3, 4',
        'zero or ends in 000, 000,000, 000,000,000, ...',
        'all decimal numbers',
    ]
});
langDef.set('en-zhcn', {
    'genders': [],
    'plurals': [
        'is [0;1]',
        'is [1;∞[',
    ]
});
langDef.set('en-zhtw', {
    'genders': [],
    'plurals': [
        'is [0;1]',
        'is [1;∞[',
    ]
});
langDef.set('en-es', {
    'genders': ['m', 'f'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-esmx', {
    'genders': ['m', 'f'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-sv', {
    'genders': ['n', 'c'],
    'plurals': [
        'is 1',
        'everything else including all decimal numbers',
    ]
});
langDef.set('en-th', {
    'genders': [],
    'plurals': [
        'everything including all decimal numbers',
    ]
});
langDef.set('en-tr', {
    'genders': [],
    'plurals': [
        'is 1 and any decimal number',
        'everything else',
    ]
});
langDef.set('en-uk', {
    'genders': ['m', 'f', 'n'],
    'plurals': [
        'ends in 1, excluding 11',
        'ends in 2-4, excluding 12-14',
        'everything not covered by forms 0, 1, 3, 4',
        'zero or ends in 000, 000,000, 000,000,000, ...',
        'all decimal numbers',
    ]
});
langDef.set('en-vi', {
    'genders': [],
    'plurals': [
        'everything including all decimal numbers',
    ]
});

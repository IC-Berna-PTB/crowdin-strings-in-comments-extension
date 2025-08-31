import * as $ from 'jquery';
import {Source2HelperModifierG} from "./Source2HelperModifierG";
import {Source2HelperModifierP} from "./Source2HelperModifierP";
import {Source2HelperModifierN} from "./Source2HelperModifierN";
import {Source2HelperModifierNP} from "./Source2HelperModifierNP";
import {Source2HelperModifierGP} from "./Source2HelperModifierGP";
import {injectExtensionScript} from "../../util/util";

let sideBySideView = false;
let sideBySideCurrentTokenId = -1;

let observerLastKnownTextContainer = '';
let observerLastKnownSideBySideCurrentTokenId = 0;
const observer = new MutationObserver(() => {
    sideBySideView = $('body').hasClass('proofread');

    // for translate view
    if($('#translation_text_container')){
        let content = $('#translation_text_container').html();
        if(observerLastKnownTextContainer !== content){
            observerLastKnownTextContainer = content;
            inject();
        }
    }

    // for proofread view
    if(sideBySideView){
        sideBySideCurrentTokenId = parseInt($('.proofread-string-wrapper.checked.check-start.check-end').data('id'));
        if(observerLastKnownSideBySideCurrentTokenId != sideBySideCurrentTokenId){
            observerLastKnownSideBySideCurrentTokenId = sideBySideCurrentTokenId;
            inject();
        }
    }
});
observer.observe(document, {
    childList:true,
    subtree:true
});


/*
 * let pathSplit = window.location.pathname.split('/');
 * pathSplit[1] = view mode (translate / proofread)
 * pathSplit[2] = project id
 * pathSplit[3] = file
 * pathSplit[4] = language pair (e.g. en-de)
 * pathSplit[5] = workflow id
 */

let lastFocusedTranslationTextarea = null;
// TODO
// - update this variable whenever #translation or any helper textarea gets focus, preferably to the id of the textarea
// DONE - when changing token, set to null
// - when clicking on #source_phrase_container > .crowdin_highlight.tag_light or .crowdin_highlight.placeholder_light, check this variable and insert the .text() value of that element in the last focused textarea. null defaults to #translation.

injectExtensionScript("source-2-plural-gender-inject.js");

export function getModifiersFromTokenContext(tokenContext: string){
    const tokenModifierRx = /.*:((?:[a-zA-Z](?:{[^{}]*})*)+)$/m;
    const extractRx = /[a-zA-Z](?:{[^{}]*})*/g;

    const m = tokenContext.match(tokenModifierRx);
    if(m){
        return m[1].match(extractRx);
    }
    return null;
}

export function getCrowdinTranslationTextArea(){
    if(sideBySideView){
        return $(`#area-${sideBySideCurrentTokenId}_-1`);
    }else{
        return $('#translation');
    }
}

export function getCrowdinTokenContext(){
    if(sideBySideView){
        return $(`#phrase_${sideBySideCurrentTokenId}`).find('.translation-context').find('div:contains("Key:"), div:contains("Identifier (Key):")').text().trim();
    }else{
        return $('#source_context_container').find('div.string-key-container--wrapper').find('div.string-key-container--text').text().trim();
    }
}

export function createPluginEditorEnhancementContainer(content: string){
    if(sideBySideView){
        $('#suggestions-wrapper').prepend(content);
    }else{
        $('#translation_wrapper').before(content);
    }
}

function inject(){
    if(sideBySideView && sideBySideCurrentTokenId === undefined){
        return;
    }

    // remove editor enhancement from DOM
    $('#source2helper-container').remove();

    // reset target textarea
    lastFocusedTranslationTextarea = null;

    // unbind event listeners
    let translationTextArea = getCrowdinTranslationTextArea();
    translationTextArea.off('input');

    // detect source2 string modifiers from token context
    let modifier_g = false; // gender receiver
    let modifier_n = false; // gender sender
    let modifier_p = false; // pluralization

    let tokenContext = getCrowdinTokenContext();
    if(tokenContext === null) return;

    const modifiers = getModifiersFromTokenContext(tokenContext);
//console.log("modifiers " + modifiers);
    if(modifiers === null) return;

    for(const modifier of modifiers){
        if(modifier[0] == 'g') modifier_g = true; // gender receiver
        else if(modifier[0] == 'n') modifier_n = true; // gender sender
        else if(modifier[0] == 'p') modifier_p = true; // pluralization
    }

    // inject helper for special source 2 token modifiers (or modifier combinations)
    if(modifiers.length == 1 && modifier_g){
//console.log("injecting g");
        new Source2HelperModifierG().inject();
    } else if(modifiers.length == 1 && modifier_n){
//console.log("injecting n");
        new Source2HelperModifierN().inject();
    } else if(modifiers.length == 1 && modifier_p){
//console.log("injecting p");
        new Source2HelperModifierP().inject();
    } else if(modifiers.length == 2 && modifier_g && modifier_p){
//console.log("injecting gp");
        new Source2HelperModifierGP().inject();
    } else if(modifiers.length == 2 && modifier_n && modifier_p){
//console.log("injecting np");
        new Source2HelperModifierNP().inject();
    } else {
        console.log(`[Source 2 Helper] This combination of string modifiers is currently not supported: ${modifiers}`);
    }
}

$(document).on('click', '.showToggle', function(){
    let $this = $(this);
    if($this.hasClass('expanded')){
        $this.removeClass('expanded').addClass('collapsed').attr('title', 'Expand');
    }else{
        $this.removeClass('collapsed').addClass('expanded').attr('title', 'Collapse');
    }
    $('#' + $this.data('id-to-toggle')).slideToggle('fast', function(){
        // animation done
    });
});

export function getGenderName(gender: string){
    switch(gender){
        case 'f': return 'Feminine';
        case 'm': return 'Masculine';
        case 'n': return 'Neutral';
        case 'c': return 'Common';
        case 'mp': return 'Masculine Personal';
        case 'ma': return 'Masculine Animate';
        case 'mi': return 'Masculine Inanimate';
    }
    return gender;
}

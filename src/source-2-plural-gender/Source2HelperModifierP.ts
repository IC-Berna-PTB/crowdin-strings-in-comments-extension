import * as $ from 'jquery';
import {Source2HelperAbstract} from "./Source2HelperAbstract";
import {langDef} from "./langDef";
import {
	createPluginEditorEnhancementContainer,
	getCrowdinTokenContext,
	getCrowdinTranslationTextArea,
	getModifiersFromTokenContext
} from "./source-2-plural-gender-entrypoint";

export class Source2HelperModifierP extends Source2HelperAbstract {
	inject(){
		let $this = this;
		let pathSplit = window.location.pathname.split("/");
		let langPair = pathSplit[4]; // e.g. "en-de"	
		let translationTextArea = getCrowdinTranslationTextArea();
		
		// instructions
		let instructions: string;
		if(this.languageUsesPlurals){
			instructions = 'This means you need to specify a translation for <b>every</b> pluralization form.';
		}else{
			instructions = 'Your target language does not use pluralization, so you only need to provide a normal translation without special Source2 syntax.';
		}

		let pdfUrlGenders = chrome.runtime.getURL('resource/pdf/Genders in Source 2.pdf');
		let pdfUrlPluralization = chrome.runtime.getURL('resource/pdf/Pluralization in Source 2.pdf');
		createPluginEditorEnhancementContainer(`
			<div id="source2helper-container">
				<div class="title">Source 2 Helper</div>
				<div>
					<div class="showToggle expanded" title="Collapse" data-id-to-toggle="source2helperTogglable"></div>
					This token uses special Source2 localization features: It uses <b>Pluralization</b>!
				<div>
				<div id="source2helperTogglable">
					<p class="small">
						${instructions}
						<br>
						Cheat Sheet PDFs:
						<a href="${pdfUrlGenders}" target="_blank">Genders in Source 2</a> | 
						<a href="${pdfUrlPluralization}" target="_blank">Pluralization in Source 2</a>
					</p>
					<hr>
					<div id="source2helperContent"></div>
				</div>
				<div id="source2helperError" class="error"></div>
			</div>
		`);
		let $source2helperContent = $('#source2helperContent');
		$.each(langDef.get(langPair).plurals, function(key, value){
			$source2helperContent.append(`<p><label for="suggestionPluralization${key}"><b>Pluralization Form ${key}:</b> <i>${value}</i></label></p>`);
			$source2helperContent.append(`<textarea id="suggestionPluralization${key}" class="suggestionPluralization" data-plural="${key}">${translationTextArea.val()}</textarea>`).on('input', function(){$this.syncToSuggestion.call($this);}).on('input', function(){$this.validate.call($this);});
		});
		
		// sync initial values
		$this.syncFromSuggestion();
		$this.validate.call($this);
		
		// add listeners to translation textarea
		translationTextArea.on('input', function(){$this.syncFromSuggestion.call($this);});
		translationTextArea.on('input', function(){$this.validate.call($this);});
	}
	
	syncFromSuggestion(){
		let pathSplit = window.location.pathname.split('/');
		let langPair = pathSplit[4]; // e.g. "en-de"
		let translationTextArea = getCrowdinTranslationTextArea();
		let suggestionText = translationTextArea.val().toString();
		let suggestionTextSplit = suggestionText.split('#|#');

		$.each(langDef.get(langPair).plurals, function(key){
			let pluralTextNew = suggestionTextSplit[key] || '';
			$('#suggestionPluralization' + key).val(pluralTextNew);
		});
	}
	
	syncToSuggestion(){
		let translationTextArea = getCrowdinTranslationTextArea();
		let suggestionText = '';
		
		let i = 0;
		let $suggestionPluralization = $('.suggestionPluralization');
		$.each($suggestionPluralization, function(key, value){
			let $value = $(value);
			if(i > 0){
				suggestionText+= '#|#';
			}
			suggestionText+= $value.val();
			i++;
		});
		translationTextArea.val(suggestionText).trigger('input');
		
		// forcefully enable 'Save' button and update text length. ideally in a future version we find out which event/function to trigger to make Crowdin do their routine properly
		$('#suggest_translation').prop('disabled', false).addClass("btn-primary");
		$('#translated_string_length').text(suggestionText.length);
		let originalStringLength = parseInt($('#original_string_length').text());
		if(suggestionText.length > 2 * originalStringLength) $('#translated_string_length').addClass('over-length-warning');
		else $('#translated_string_length').removeClass('over-length-warning');
	}
	
	validate(){
		let pathSplit = window.location.pathname.split('/');
		let langPair = pathSplit[4]; // e.g. "en-de"
		let translationTextArea = getCrowdinTranslationTextArea();
		
		let errors = [];
		
		// count pluralization splitters
		let splittersFound = (translationTextArea.val().toString().match(/#\|#/g) || []).length;
		let splittersExpected = langDef.get(langPair).plurals.length - 1;
		if(splittersFound != splittersExpected){
			errors.push(`Warning: Number of pluralization splitters (<code>#|#</code>) does not match expectation. Expected ${splittersExpected}, but found ${splittersFound}`);
		}
		
		// get token name, find token modifier for pluralization, extract modifier variables
		let tokenContext = getCrowdinTokenContext();
		let modifierVariables = [];
		let modifierVariablesMissing: string[] = [];
		if(tokenContext){
			const modifiers = getModifiersFromTokenContext(tokenContext);
			if(modifiers){
				for(const modifier of modifiers){
					if(modifier[0] == 'p'){
						if(modifier.length > 1){
							const modifierVariablesRx = /\{(.*?)[:}]/g;
							let matches = [];
							while(matches = modifierVariablesRx.exec(modifier)){
								modifierVariables.push(matches[1]);
							}
						}
					}
				}
			}
			
			// check if all variables are present in all pluralization forms
			if(modifierVariables.length > 0){
				let pluralizationTextAreas: NodeListOf<HTMLTextAreaElement> = document.querySelectorAll('textarea.suggestionPluralization')
				for(let modifierVariable of modifierVariables){
					pluralizationTextAreas.forEach(e => {
						if(!e.value.includes(modifierVariable)){
							if(modifierVariablesMissing.indexOf(modifierVariable) === -1){
								modifierVariablesMissing.push(modifierVariable);
							}
						}
					});
				}
			}
			if(modifierVariablesMissing.length > 0){
				errors.push(`Warning: Could not find the following pluralization variable(s) in all pluralization forms: <code>${modifierVariablesMissing}</code>`);
			}
		}
		
		if(errors.length > 0){
			$('#source2helperError').html(errors[0]);
		}else{
			$('#source2helperError').html('');
		}
	}
}

import * as $ from 'jquery';
import {Source2HelperAbstract} from "./Source2HelperAbstract";
import {langDef} from "./langDef";
import {
	createPluginEditorEnhancementContainer, getCrowdinTokenContext,
	getCrowdinTranslationTextArea, getGenderName, getModifiersFromTokenContext
} from "./source-2-plural-gender-entrypoint";

export class Source2HelperModifierNP extends Source2HelperAbstract {
	inject(){
		let $this = this;
		let pathSplit = window.location.pathname.split("/");
		let langPair = pathSplit[4]; // e.g. "en-de"	
		let translationTextArea = getCrowdinTranslationTextArea();
		
		// instructions
		let instructions = '';
		if(this.languageUsesPlurals && this.languageUsesGenders){
			instructions = 'This means you need to specify a grammatical gender for this token. <i>Gender Receiver</i> tokens will use this information to determine proper grammar. You also need to specify a translation for <b>every</b> grammatical pluralization form.';			
		}else if(!this.languageUsesPlurals && !this.languageUsesGenders){
			instructions = 'Your target language does neither use multiple gender forms nor multiple pluralization forms, so you only need to provide a normal translation without special Source2 syntax.';
		}else if(this.languageUsesPlurals && !this.languageUsesGenders){
			instructions = 'Your target language does not use grammatical genders, so you only need to provide one translation per pluralization form.';
		}else if(!this.languageUsesPlurals && this.languageUsesGenders){
			return; // not implemented
		}
		
		let editorGender = '';
		if(this.languageUsesGenders){
			editorGender = `					<p><label for="suggestionGenderSelection"><b>Gender</b></label></p>
					<select id="suggestionGenderSelection">
						<option value="none" disabled>Please Select Gender</option>
					</select>`;
		}

		let pdfUrlGenders = chrome.runtime.getURL('resource/pdf/Genders in Source 2.pdf');
		let pdfUrlPluralization = chrome.runtime.getURL('resource/pdf/Pluralization in Source 2.pdf');
		createPluginEditorEnhancementContainer(`
			<div id="source2helper-container">
				<div class="title">Source 2 Helper</div>
				<div>
					<div class="showToggle expanded" title="Collapse" data-id-to-toggle="source2helperTogglable"></div>
					This token uses special Source2 localization features: It's a <b>Gender Sender</b>, <i>and</i> uses <b>Pluralization</b>!
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
					${editorGender}
					<div id="source2helperPluralizationContent"></div>
				</div>
				<div id="source2helperError" class="error"></div>
			</div>
		`);
		
		// gender selection part
		if(this.languageUsesGenders){
			let $suggestionGenderSelection = $('#suggestionGenderSelection');
			$.each(langDef.get(langPair).genders, function(key, value){
				$suggestionGenderSelection.append(`<option value="${value}">${getGenderName(value)}</option>`);
			});
			$suggestionGenderSelection.on('input', function(){$this.syncToSuggestion.call($this);}).on('input', function(){$this.validate.call($this);});
		}
		
		// pluralization part
		let $source2helperPluralizationContent = $('#source2helperPluralizationContent');
		$.each(langDef.get(langPair).plurals, function(key, value){
			$source2helperPluralizationContent.append(`<p><label for="suggestionPluralization${key}"><b>Pluralization Form ${key}:</b> <i>${value}</i></label></p>`);
//			$source2helperPluralizationContent.append(`<textarea id="suggestionPluralization${key}" class="suggestionPluralization" data-plural="${key}">${translationTextArea.val()}</textarea>`).on('input', $this.syncToSuggestion.call($this)).on('input', $this.validate.call($this));
			$source2helperPluralizationContent.append(`<textarea id="suggestionPluralization${key}" class="suggestionPluralization" data-plural="${key}">${translationTextArea.val()}</textarea>`).on('input', function(){$this.syncToSuggestion.call($this);}).on('input', function(){$this.validate.call($this);});
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
		let genderSenderSelect = $('#suggestionGenderSelection');
		let suggestionText = translationTextArea.val().toString();
		
		if(this.languageUsesGenders){
			// regex the suggestion text
			const pattern = /#\|(\w+)\|#(.*?)(?=#\|(\w+)\|#|$)/g;
			let genders: string[] = [];
			let pluralforms = [];
			let match;
			while ((match = pattern.exec(suggestionText)) !== null) {
				if(!genders.includes(match[1])) genders.push(match[1]);
				pluralforms.push(match[2]);
			}

			// gender
			if(genders.length == 0){
				genderSenderSelect.val('none');
				$('#suggestionPluralization0').val(suggestionText);
			}else{
				genderSenderSelect.val(genders[0]);

				// pluralization
				let i = 0;
				$.each(langDef.get(langPair).plurals, function(key){
					$('#suggestionPluralization' + key).val(pluralforms[i]);
					i++;
				});
			}
		}else{
			let suggestionTextSplit = suggestionText.split('#|#');

			$.each(langDef.get(langPair).plurals, function(key){
				let pluralTextNew = suggestionTextSplit[key] || '';
				$('#suggestionPluralization' + key).val(pluralTextNew);
			});
		}
	}
	
	syncToSuggestion(){
		let $this = this;
		let translationTextArea = getCrowdinTranslationTextArea();

		// identify gender
		let genderBit = '';
		let selectedGender = $('#suggestionGenderSelection option:selected').val();
		if(selectedGender !== 'none'){
			genderBit = `#|${selectedGender}|#`;
		}
		
		// text
		let suggestionText = '';
		
		let $suggestionPluralization = $('.suggestionPluralization');
		let i = 0;
		$.each($suggestionPluralization, function(key, value){
			let $value = $(value);
			if($this.languageUsesGenders){
				suggestionText+= genderBit;
			}else{
				if(i > 0){
					suggestionText+= '#|#';
				}
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

		// regex for gender tag
		const pattern = /#\|(\w+)\|#(.*?)(?=#\|(\w+)\|#|$)/g;
		let genderTagsDetected = [];
		let match;
		while ((match = pattern.exec(translationTextArea.val().toString())) !== null) {
			genderTagsDetected.push(match[1]);
		}

		if(this.languageUsesGenders){
			// missing gender tag
			if(genderTagsDetected.length == 0){
				errors.push(`Warning: No gender tag found. Please select a gender`);
			}
			
			// invalid gender tag
			let genderTagsDetectedUnique = new Set(genderTagsDetected);
			genderTagsDetected.forEach(genderTag => {
				if(!langDef.get(langPair).genders.includes(genderTag)){
					errors.push(`Warning: Invalid gender tag detected: <code>#|${genderTag}|#</code>`);
				}
			});
			
			// multiple different gender tags
			if(genderTagsDetectedUnique.size > 1){
				let genderTagsUnique = "<code>#|" + Array.from(genderTagsDetectedUnique).join("|#</code>, <code>#|") + "|#</code>";
				errors.push(`Warning: Multiple different gender tags found: ${genderTagsUnique}. There should only be one different gender tag`);
			}
			
			// invalid count of gender tag
			let expectedCountPerGenderTag = langDef.get(langPair).plurals.length;
			let genderTagCount = genderTagsDetected.filter(x => x==genderTagsDetected[0]).length;
			if(genderTagsDetected.length > 0 && genderTagCount != expectedCountPerGenderTag){
				errors.push(`Warning: Number of gender tags for ${getGenderName(genderTagsDetected[0])} (<code>#|${genderTagsDetected[0]}|#</code>) does not match expectation. Expected ${expectedCountPerGenderTag}, but found ${genderTagCount}.`);
			}
		}else{
			// check for gender tags
			if(genderTagsDetected.length > 0){
				let genderTags = "<code>#|" + genderTagsDetected.join("|#</code>, <code>#|") + "|#</code>";
				errors.push(`Warning: Your target language should not use gender tags, but gender tag(s) were found: ${genderTags}`);
			}

			// invalid count of pluralization splitters
			if(this.languageUsesPlurals){
				let splittersFound = (translationTextArea.val().toString().match(/#\|#/g) || []).length;
				let splittersExpected = langDef.get(langPair).plurals.length - 1;
				if(splittersFound != splittersExpected){
					errors.push(`Warning: Number of pluralization splitters (<code>#|#</code>) does not match expectation. Expected ${splittersExpected}, but found ${splittersFound}`);
				}
			}
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
					pluralizationTextAreas.forEach(e =>{
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

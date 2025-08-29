import * as $ from 'jquery';
import {Source2HelperAbstract} from "./Source2HelperAbstract";
import {langDef} from "./langDef";
import {
	createPluginEditorEnhancementContainer,
	getCrowdinTranslationTextArea,
	getGenderName
} from "./source-2-plural-gender-content-script";

export class Source2HelperModifierG extends Source2HelperAbstract {
	inject(){
		let $this = this;
		let pathSplit = window.location.pathname.split('/');
		let langPair = pathSplit[4]; // e.g. "en-de"	
		let translationTextArea = getCrowdinTranslationTextArea();
		
		// instructions
		let instructions: string;
		if(this.languageUsesGenders){
			instructions = 'This means this token can be used in the context of different grammatical genders. You need to provide translations for <b>every</b> gender form.';
		}else{
			instructions = 'Your target language does not use gender forms, so you only need to provide a normal translation without special Source2 syntax.';
		}

		let pdfUrlGenders = chrome.runtime.getURL('resource/pdf/Genders in Source 2.pdf');
		let pdfUrlPluralization = chrome.runtime.getURL('resource/pdf/Pluralization in Source 2.pdf');
		createPluginEditorEnhancementContainer(`
			<div id="source2helper-container">
				<div class="title">Source 2 Helper</div>
				<div>
					<div class="showToggle expanded" title="Collapse" data-id-to-toggle="source2helperTogglable"></div>
					This token uses special Source2 localization features: It's a <b>Gender Receiver</b>!
				</div>
				<div id="source2helperTogglable">
					<p class="small">
						${instructions}
						<br>
						Cheat Sheet PDFs:
						<a href="${pdfUrlGenders}" target="_blank">Genders in Source 2</a> | 
						<a href="${pdfUrlPluralization}" target="_blank">Pluralization in Source 2</a>
					</p>
					<div id="source2helperContent"></div>
				</div>
				<div id="source2helperError" class="error"></div>
			</div>
		`);
		
		if(this.languageUsesGenders){
			let $source2helperContent = $('#source2helperContent');
			$source2helperContent.append(`<hr>`);
			$.each(langDef.get(langPair).genders, function(key, value){
				$source2helperContent.append(`<p><label for="suggestionGenderReceiver${value}"><b>${getGenderName(value)}</b></label></p>`);
				$source2helperContent.append(`<textarea id="suggestionGenderReceiver${value}" class="suggestionGenderReceiver" data-gender="${value}">${translationTextArea.val()}</textarea>`).on('input', function(){$this.syncToSuggestion.call($this);}).on('input', function(){$this.validate.call($this);});
			});
		}
			
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
		
		$.each(langDef.get(langPair).genders, function(key, value){
			if(suggestionText.includes(`#|${value}|#`)){
				let newValue = suggestionText.split(`#|${value}|#`).pop().split('#|')[0];
				$('#suggestionGenderReceiver' + value).val(newValue);
			}
		});
	}

	syncToSuggestion(){
		let translationTextArea = getCrowdinTranslationTextArea();
		let suggestionText = '';

		let $suggestionGenderReceiver = $('.suggestionGenderReceiver');
		$.each($suggestionGenderReceiver, function(key, value){
			let $value = $(value);
			suggestionText+= `#|${$value.data('gender')}|#${$value.val()}`;
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
			$.each(langDef.get(langPair).genders, function(key, value){
				if(!genderTagsDetected.includes(value)){
					errors.push(`Warning: Missing gender tag for ${getGenderName(value)} (<code>#|${value}#</code>)`);
					return false;
				}
			});
			
			// duplicate gender tags
			function findDuplicates(arr: string[]){ // function to find duplicates in an array and return an array of the duplicates
				return [...new Set(arr.filter((elem, idx, arr) => arr.indexOf(elem) !== idx))]
			}
			let duplicateGenderTags = findDuplicates(genderTagsDetected);
			if(duplicateGenderTags.length > 0){
				let genderTags = "<code>#|" + duplicateGenderTags.join("|#</code>, <code>#|") + "|#</code>";
				errors.push(`Warning: Duplicate gender tags found. Each gender tag should only be used once, but these were used multiple times: ${genderTags}`);
			}
			
			// invalid gender tag
			new Set(genderTagsDetected);
			genderTagsDetected.forEach(genderTag => {
				if(!langDef.get(langPair).genders.includes(genderTag)){
					errors.push(`Warning: Invalid gender tag detected: <code>#|${genderTag}|#</code>`);
				}
			});
		}else{
			// check for gender tags
			if(genderTagsDetected.length > 0){
				let genderTags = "<code>#|" + genderTagsDetected.join("|#</code>, <code>#|") + "|#</code>";
				errors.push(`Warning: Your target language should not use gender tags, but gender tag(s) were found: ${genderTags}`);
			}
		}
		
		if(errors.length > 0){
			$('#source2helperError').html(errors[0]);
		}else{
			$('#source2helperError').html('');
		}
	}
}

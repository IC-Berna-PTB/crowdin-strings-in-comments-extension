import * as $ from 'jquery';
import {Source2HelperAbstract} from "./Source2HelperAbstract";
import {
	createPluginEditorEnhancementContainer,
	getCrowdinTranslationTextArea, getGenderName
} from "./source-2-plural-gender-entrypoint";
import {langDef} from "./langDef";

export class Source2HelperModifierN extends Source2HelperAbstract {
	inject(){
		let $this = this;
		let pathSplit = window.location.pathname.split('/');
		let langPair = pathSplit[4]; // e.g. "en-de"	
		let translationTextArea = getCrowdinTranslationTextArea();
		
		// instructions
		let instructions: string;
		if(this.languageUsesGenders){
			instructions = 'This means you need to specify a grammatical gender for this token. <i>Gender Receiver</i> tokens will use this information to determine proper grammar.';
		}else{
			instructions = 'Your target language does not use grammatical genders, so you only need to provide a normal translation without special Source2 syntax.';
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
					This token uses special Source2 localization features: It's a <b>Gender Sender</b>!
				</div>
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
					<p><label for="suggestionGenderSenderText"><b>Translation</b></label></p>
					<textarea id="suggestionGenderSenderText" class="suggestionGenderSender">${translationTextArea.val()}</textarea>
				</div>
				<div id="source2helperError" class="error"></div>
			</div>
		`);
		
		
		let $suggestionGenderSelection = $('#suggestionGenderSelection');
		$.each(langDef.get(langPair).genders, function(key, value){
			$suggestionGenderSelection.append(`<option value="${value}">${getGenderName(value)}</option>`);
		});
		$suggestionGenderSelection.on('input', function(){$this.syncToSuggestion.call($this);}).on('input', function(){$this.validate.call($this);});
		$('#suggestionGenderSenderText').on('input', function(){$this.syncToSuggestion.call($this);}).on('input', function(){$this.validate.call($this);});
		
		// sync initial values
		$this.syncFromSuggestion();
		$this.validate.call($this);
		
		// add listeners to translation textarea
		translationTextArea.on('input', function(){$this.syncFromSuggestion.call($this);});
		translationTextArea.on('input', function(){$this.validate.call($this);});
	}

	syncFromSuggestion(){
		let translationTextArea = getCrowdinTranslationTextArea();
		let genderSenderSelect = $('#suggestionGenderSelection');
		let genderSenderTextArea = $('#suggestionGenderSenderText');
		
		let genderMatch = translationTextArea.val().toString().match(/#\|(\w+)\|#(.*)/);
		if(!this.languageUsesGenders || genderMatch === null){
			genderSenderSelect.val('none');
			genderSenderTextArea.val(translationTextArea.val());
		}else{
			let gender = genderMatch[1];
			genderSenderSelect.val(gender);
			genderSenderTextArea.val(genderMatch[2]);
		}
	}

	syncToSuggestion(){
		let translationTextArea = getCrowdinTranslationTextArea();
		let genderSenderTextArea = $('#suggestionGenderSenderText');
		
		// identify gender
		let genderBit = '';
		let selectedGender = $('#suggestionGenderSelection option:selected').val();
		if(selectedGender !== 'none'){
			genderBit = `#|${selectedGender}|#`;
		}
		
		// text
		let suggestionText = '';
		if(this.languageUsesGenders){
			suggestionText+= genderBit;
		}
		suggestionText+= genderSenderTextArea.val();
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
			
			// too many gender tags
			if(genderTagsDetected.length > 1){
				let genderTags = "<code>#|" + genderTagsDetected.join("|#</code>, <code>#|") + "|#</code>";
				errors.push(`Warning: Too many gender tags found. There should only be one, but found ${genderTagsDetected.length}: ${genderTags}`);
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

import {langDef} from "./langDef";

export class Source2HelperAbstract {
	languageUsesPlurals = false;
	languageUsesGenders = false;
	
	constructor() {
		let pathSplit = window.location.pathname.split("/");
		let langPair = pathSplit[4]; // e.g. "en-de"	
		this.languageUsesPlurals = langDef.get(langPair).plurals.length > 1;
		this.languageUsesGenders = langDef.get(langPair).genders.length > 1;
	}
	
	inject(){
		console.log("Not implemented");
	}
	syncFromSuggestion(){
		console.log("Not implemented");
	}
	syncToSuggestion(){
		console.log("Not implemented");
	}
	validate(){
		console.log("Not implemented");
	}
}

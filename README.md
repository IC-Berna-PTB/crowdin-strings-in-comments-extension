# Crowdin Strings in Comments Extension
_or "how I should not name my projects something specific since they always grow"_

## I just want to install it!
[Firefox](https://addons.mozilla.org/firefox/addon/crowdin-strings-in-comments/) |
[Chrome](https://chromewebstore.google.com/detail/crowdin-strings-in-commen/gnapdafbifmnflaflobbkafpilmahodb?authuser=0&hl=pt-BR)

## Basic information

This extension includes a collection of features to make translation work on Crowdin
easier, quicker and more ergonomic.

## Feature modules
These are the modules that implement new, user-facing features.

### Strings in comments
Parses Crowdin URLs in string comments and, if they link to a specific string (ends with `#<digits>`),
has a search query, advanced filter or CroQL query, shows the results inline.

Plus, when copying a URL for a specific string, if it has a key, the extension adds the `csic-key` query parameter
to the URL. This works as a fallback when the file is updated, the numeric Crowdin ID changes, but the key doesn't.

### Default language

Lets the user set a default language for them. After setting a default language:
* When opening a URL without a language set, the extension will automatically
select your default language (instead of you manually having to select the language 
in the list).
* When opening a URL with a language set other than your default, the extension
will offer to swap to your default.

### Show full file name

Shows the full file name below each string.

### Prevent key copy

Lets you selectively... select parts of string keys without Crowdin auto-copying it
to your clipboard. Adds a dedicated copy button besides the key.

### Prevent pre-filtering
When opening a Crowdin URL without any filters, Crowdin, in its infinite wisdom,
autoapplies the last filters you used to it, which can confuse the user.

This disables that behavior.

### Dark theme HTML preview
Forces the dark theme when previewing HTML files on dark theme-Crowdin,
just like TXTs.

### All-content redirect
If enabled, when opening any URL for a project that has an "All Content" workflow
(internally called "out of workflow"), the user is auto-redirected to that workflow.

### Source 2 Plural & Gender Helper
(For Valve projects only)
Helps translators properly tag strings that need to be pluralized or genderized.

## Auxiliary modules

### Extension settings menu

The menu to change and toggle settings. Available through the puzzle-piece icon on the top right
of the Crowdin web page.

Currently, the menu is built by itself, without decoupling. This will change SoonTM.

### Extension settings server

This is called a "server" in the sense that this module is the one that coordinates any kind
of request for a setting to be retrieved, changed or saved that comes from any other module.

The settings are saved in the [sync storage bin](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync)
of the browser.

**The extension doesn't use any third-party services.
Any internet communication done is exclusively with your Crowdin instance.**

### Common
Utility functions and stuff.
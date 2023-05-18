# 1.7.1
- Added official DeepL API. It has a limit of 500 000 words per month, so it's mostly here as a backup when the standard way breaks for some reason. But you're free to use it if you want, it's a little bit faster.

# 1.7.0-hotfix1
- Fixed broken DeepL translation

# 1.7.0
- Added 16 fonts that can be changed through the menu
- Cleaned up the GUI

# 1.6.1
- Colorized a black and white icon that was hard to see on a dark background

# 1.6.0
- Added buttons that link to several search engines and dictionaries (Google images, Jisho, Wikipedia etc.)

# 1.5.3
- Added a preview option for Anki cards (if they're in collection)
- Changed the logic of left click button, so that it doesn't change the status of known and ignored words
- Changed the app logo

# 1.5.2
- Added a favicon
- Added a window frame (bar for moving) for translaton window when it's not transparent
- Updated electron forge to 6.0.4

# 1.5.1
- Added a continuous clipboard listening for Linux (and maybe Mac, I can't test myself)
- Fixed a bug which caused dictionary window to disappear when clipboard contents changed
- Updated from Electron 20 to Electron 22

# 1.5.0
- Now the configuration is being stored in a local path, => shouldn't require root anymore
- Now the program exits only on exiting the reader (other windows don't close the program)
- Added exit confirmation dialog
- Now the window position is being remembered in the configuration files
- Simplified options menu
- Added reset buttons for options and other settings to the options menu

# 1.4.2
- Added release builds for Linux

# 1.4.1
- Simplified mouse buttons:
	* LMB - "seen"
	* RMB - "known"
	*	Ctrl+LMB - "ignored"
- Added feedback messages for audio and Anki
- Added a border around windows
- Added English translation being displayed in 
Anki deck (japReader.apkg). Only works if you
had mined the words with translation window open.

# 1.4.0
- Updated the version of Electron from 12 to 20
- Fixed clipboard not being read on Linux

# 1.3.2c
- Fixed the night-mode CSS (theme), so that it works on mobile.
	(dark mode :root was read incorrectly in AnkiDroid)

# 1.3.2b
- Changed the Anki deck (japReader.apkg) to match the main app theme.

# 1.3.2
- Added light mode.
- Restyled a little bit.
- Removed version names from files and intructions, 
    because it's annoying to update everything every update.

# 1.3.1
- Restyled everything, because the contrast was too random 
    and some things were hard to read.

# 1.3.0
- Added the ability to change the status of a word with mouse buttons:
    * Seen: Right Mouse Button
    * Known: Middle Mouse Button
    * Ignore: Ctrl + Left Mouse Button
- Changed the method of adding a word to Anki. 
Now it is added in the background, and a pop-up window doesn't show anymore.
- Added shortcuts for playing audio and adding the word to Anki:
    * Play audio: A
    * Add to Anki: Q
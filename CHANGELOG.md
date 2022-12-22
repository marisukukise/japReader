# 1.4.3-alpha (still in development, don't use this version)
- Changed the location of configuration files to be stored on a local path*
- Added the ability to change the config path in options*
- Changed the method in which windows close*

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
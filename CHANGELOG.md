# 1.5.0-alpha (still in development, don't use this version)
- Now the configuration is being stored in a local path, => shouldn't require root anymore
- Now the program exits only on exiting the reader (other windows don't close the program)
- Added exit confirmation dialog
- Now the window position is being remembered in the configuration files
- Simplified options menu
- Added reset buttons for options and other settings to the options menu*

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
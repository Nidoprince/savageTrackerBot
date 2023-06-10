# savageTrackerBot
Discord bot for tracking initiative, wounds, and bennys.

In order to store bennys and wounds between sessions, this bot needs its own channel called 'testchannel' which can't be posted in.

Commands:

- /character - commands for adding, removing, or listing characters to store between sessions.
  - /character add \<name> \<bennys> \<wounds> - Adds a new character with the specified name, amount of bennys, and amount of wounds.  If unspecified, bennys will be 3 and wounds will be 0.
  - /character remove \<name> - Removes a character from the storage with the specified name.
  - /character list - Lists all the characters stored on the server with their number of bennys and wounds.
  
- /bennys - command for adding, removing, or resetting bennys.
  - /bennys add \<number> \<name> - Adds the specified number of bennys to the character with the specified name.
  - /bennys remove \<number> \<name> - Removes the specified number of bennys from the character with the specified name.
  - /bennys reset all - Sets all characters number of bennys to 3.
  - /bennys reset \<name1> \<name2> ... - Sets all characters listed's bennys to 3.
  
- /wounds - command for adding, removing, or resetting wounds.
  - /wounds add \<number> \<name> - Adds the specified number of wounds to the character with the specified name.
  - /wounds remove \<number> \<name> - Removes the specified number of wounds from the character with the specified name.
  - /wounds reset all - Sets all characters number of wounds to 0.
  - /wounds reset \<name1> \<name2> ... - Sets all characters listed's wounds to 0.
  
- /combat \<name1> \<name2> ... - Shuffles the deck and prepares to start a combat with the listed names.
- /round - Deals out the cards to all characters currently in combat and displays the initiative order, round number, and any notes.
- /add \<name> - Adds a character with the specified name to the combat to be dealt in next round.
- /add \<name> now - Adds a character with the specified name to the combat, deals them in for this round, and displays the initiative.
- /remove \<name1> \<name2> ... - Removes listed combatants from the combat.
- /note \<name> \<note> - Adds a note which will be displayed next to a characters initiative each round.
- /note \<name> - Removes any note a character might have had.
- /draw \<number> - Draws and displays the number of cards specified.
- /draw \<number> \<name> - Draws the specified number of cards and adds them to the character's initiative, then displays the rounds initiative with the updated cards.
- /current - Displays the current rounds initiative.
- /shuffle - Shuffles the deck.

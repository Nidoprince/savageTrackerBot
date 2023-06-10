// Import the Discord API
Discord = require("discord.js");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//Connect to the API as a user.
var bot = new Discord.Client({
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.MessageContent,
		Discord.GatewayIntentBits.GuildMembers,
	],});

function ordinalCard(cardString) {
  if(cardString.indexOf("🃏")>-1){
    return 200
  }
  else{
    let numberList = ["2","3","4","5","6","7","8","9","J","Q","K","A"]
    let suitList = ["♧","♢","♡","♤"]
    return 10*numberList.indexOf(cardString[0])+suitList.indexOf(cardString[1])
  }
}

class Deck {
  constructor() {
    this.remains = []
    for (let v of ["A","2","3","4","5","6","7","8","9","J","Q","K"]) {
      for (let s of ["♤","♧","♡","♢"]) {
        this.remains.push(v+s)
      }
    }
    this.remains.push("🃏J")
    this.remains.push("🃏J")
  }
  draw() {
    if(this.remains.length == 0){
      return false
    }
    else{
      var cardNum = getRandomInt(this.remains.length)
      var card = this.remains[cardNum]
      this.remains.splice(cardNum,1)
      return card
    }
  }
  get getRemains(){
    return this.remains
  }
  shuffle() {
    this.remains = []
    for (let v of ["A","2","3","4","5","6","7","8","9","J","Q","K"]) {
      for (let s of ["♤","♧","♡","♢"]) {
        this.remains.push(v+s)
      }
    }
    this.remains.push("🃏J")
    this.remains.push("🃏J")
  }
  jokers() {
    return this.remains.filter((x) => x == "🃏J").length == 2
  }

}
//Grab our Bot Token from the environment variable on our computer.
const token = process.env.SAVAGE_BOT_TOKEN;

//Stuff that gets run once the bot connects successfully
bot.on('ready', () =>
{
  console.log("Logged in as "+bot.user.username+" "+bot.user.id+".");
  console.log('I am ready!')
  exports.activeServers = bot.guilds.cache;
  exports.infoList = []
  for (let value of exports.activeServers) //Lists the servers that this bot is active in.
  {
    console.log(value[1].name);
    value[1].channels.fetch()
      .then((channels) => {
        textChannels = channels.filter((x) => x.type == 0)
        for(let c of textChannels){
          console.log(c[1].name)
          if(c[1].name == "testchannel"){
            exports.infoList.push({guild:value[1].id,infoChannel:c[1],info:[]})
          }
        }
        for(let c of exports.infoList){
          c.infoChannel.messages.fetch().then((messages) =>{
            myMessages = messages.filter((m) => m.author.id == bot.user.id)
            console.log(myMessages)
            console.log(myMessages.size)
            if(myMessages.size == 0){
              c.infoChannel.send("Wound and Benny Storage Message")
            }
            else{
              text = myMessages.at(0).content
              characters = text.split("\n").slice(1)
              characterInfo = []
              for(let character of characters){
                cInfo = character.split(" ")
                characterData = {}
                if(cInfo.length == 3){
                  characterData.name = cInfo[0]
                  characterData.bennys = cInfo[1]
                  characterData.wounds = cInfo[2]
                  characterInfo.push(characterData)
                }
              }
              console.log(characterInfo)
              c.info = characterInfo
            }
          })
        }
      })
      .catch(console.error)
  }
  exports.deck = new Deck()
  rem = [...exports.deck.getRemains].sort((x,y) => ordinalCard(x)-ordinalCard(y))
  console.log(rem)
})

function updateStorageMessage(guildId){
  allInfo = exports.infoList.filter((x) => x.guild == guildId)
  if(allInfo.length == 0){
    console.log("No guild found.")
  }
  else{
    allInfo = allInfo[0]
    channel = allInfo.infoChannel
    info = allInfo.info
    channel.messages.fetch().then((messages) => {
      myMessages = messages.filter((m) => m.author.id == bot.user.id)
      updatedMessage = "Wound and Benny Storage Message"
      for (let character of info){
        updatedMessage += "\n"+character.name+" "+character.bennys+" "+character.wounds
      }
      if(myMessages.size == 0){
        c.infoChannel.send(updatedMessage)
      }
      else{
        myMessages.at(0).edit(updatedMessage)
      }
    })
  }
}

function displayInitiative(combatants,round){
  let output = "Initiative Round "+round+":\n"
  combatants = combatants.filter((x) => "cards" in x)
  combatants.sort((x,y) => ordinalCard(y.cards[0]) - ordinalCard(x.cards[0]))
  for (let c of combatants){
    output += c.name+" "
    for (let card of c.cards){
      output += card+" "
    }
    if("note" in c){
      output += "- "+c.note
    }
    output += "\n"
  }
  return output
}

//Stuff that is run each time a message is seen by the bot.
bot.on("messageCreate", (message) =>
{
  console.log(message.content)
  if(message.content.substring(0,1) == "/") //Checks if the first letter of a message is a /
  {
    let commandArgs = message.content.substring(1).split(/\s+/) //Removes the ! and then breaks the rest of the message apart into chunks based on whitespace

    if(commandArgs[0] == "character"){
      if(commandArgs.length == 1){
        message.channel.send("Please specify if you are add a new character or remove an existing one.")
      }
      else if(commandArgs[1] == "add"){
        if(commandArgs.length == 2){
          message.channel.send("Please specify name of new character and optionally bennys and wounds")
        }
        else {
          newChar = {bennys: 3, wounds: 0}
          newChar.name = commandArgs[2]
          if(commandArgs.length > 3){
            newChar.bennys = commandArgs[3]
          }
          if(commandArgs.length > 4){
            newChar.wounds = commandArgs[4]
          }
          allInfoIndex = exports.infoList.findIndex((x) => x.guild == message.guild.id)
          infoList = exports.infoList[allInfoIndex].info
          infoList.push(newChar)
          exports.infoList[allInfoIndex].info = infoList
          message.channel.send("New character added with name: "+newChar.name+" bennys: "+newChar.bennys+" and wounds: "+newChar.wounds)
          updateStorageMessage(message.guild.id)
        }
      }
      else if(commandArgs[1] == "remove"){
        if(commandArgs.length == 2){
          message.channel.send("Please specify name of character to remove.")
        }
        else{
          allInfoIndex = exports.infoList.findIndex((x) => x.guild == message.guild.id)
          infoList = exports.infoList[allInfoIndex].info
          index = infoList.findIndex((x) => x.name == commandArgs[2])
          if(index == -1){
            message.channel.send("No character found with name: "+commandArgs[2])
          }
          else{
            exports.infoList[allInfoIndex].info = infoList.filter((x) => x.name != commandArgs[2])
            message.channel.send(commandArgs[2]+" removed from character list.")
            updateStorageMessage(message.guild.id)
          }
        }
      }
      else if(commandArgs[1] == "list"){
        allInfoIndex = exports.infoList.findIndex((x) => x.guild == message.guild.id)
        infoList = exports.infoList[allInfoIndex].info
        output = "Characters:"
        for(let c of infoList){
          output += "\n"+c.name+" - Bennys: "+c.bennys+" - Wounds: "+c.wounds
        }
        message.channel.send(output)
      }
      else{
        message.channel.send(commandArgs[1]+" not recognized as a character command.  Try add, remove, or list.")
      }
    }

    if(commandArgs[0] == "bennys" || commandArgs[0] == "wounds")
    {
      whichStat = commandArgs[0]
      if(commandArgs.length == 1){
        message.channel.send("Specify whether you are adding, removing, or resetting "+whichStat+".")
      }
      else if(commandArgs[1] == "add"){
        if(commandArgs.length == 2){
          message.channel.send("Specify how many "+whichStat+" to add and to which character.")
        }
        else if(commandArgs.length == 3){
          message.channel.send("Specify which character is recieving "+commandArgs[2]+" "+whichStat+".")
        }
        else if(isNaN(Number(commandArgs[2]))){
          message.channel.send("The argument after add must be a number.")
        }
        else{
          toAdd = Number(commandArgs[2])
          console.log(toAdd)
          whom = commandArgs[3]
          allInfoIndex = exports.infoList.findIndex((x) => x.guild == message.guild.id)
          infoList = exports.infoList[allInfoIndex].info
          index = infoList.findIndex((x) => x.name == whom)
          if(index == -1){
            message.channel.send("No character found with name: "+whom+".")
          }
          else{
            newStat = Number(infoList[index][whichStat]) + toAdd
            exports.infoList[allInfoIndex].info[index][whichStat] = newStat
            message.channel.send(whom+"'s "+whichStat+" are now "+newStat+".")
            updateStorageMessage(message.guild.id)
          }
        }
      }
      else if(commandArgs[1] == "remove"){
        if(commandArgs.length == 2){
          message.channel.send("Specify how many "+whichStat+" to remove and from which character.")
        }
        else if(commandArgs.length == 3){
          message.channel.send("Specify which character is losing "+commandArgs[2]+" "+whichStat+".")
        }
        else if(isNaN(Number(commandArgs[2]))){
          message.channel.send("The argument after remove must be a number.")
        }
        else{
          toRemove = Number(commandArgs[2])
          whom = commandArgs[3]
          allInfoIndex = exports.infoList.findIndex((x) => x.guild == message.guild.id)
          infoList = exports.infoList[allInfoIndex].info
          index = infoList.findIndex((x) => x.name == whom)
          if(index == -1){
            message.channel.send("No character found with name: "+whom+".")
          }
          else{
            newStat = Number(infoList[index][whichStat]) - toRemove
            if(newStat < 0){
              newStat = 0
            }
            exports.infoList[allInfoIndex].info[index][whichStat] = newStat
            message.channel.send(whom+"'s "+whichStat+" are now "+newStat+".")
            updateStorageMessage(message.guild.id)
          }
        }

      }
      else if(commandArgs[1] == "reset"){
        if(commandArgs.length == 2){
          message.channel.send("Either specify 'all' or list the characters that are having their "+whichStat+" reset.")
        }
        else{
          allInfoIndex = exports.infoList.findIndex((x) => x.guild == message.guild.id)
          infoList = exports.infoList[allInfoIndex].info
          resetTo = 0
          if(whichStat == "bennys"){
            resetTo = 3
          }
          if(commandArgs[2] == "all"){
            for(let c in infoList){
              exports.infoList[allInfoIndex].info[c][whichStat] = resetTo
            }
            message.channel.send("All characters on this server have had their "+whichStat+" reset.")
            updateStorageMessage(message.guild.id)
          }
          else{
            characters = commandArgs.slice(2)
            found = []
            unfound = []
            for(let c of characters){
              index = infoList.findIndex((x) => x.name == c)
              if(index == -1){
                unfound.push(c)
              }
              else{
                found.push(c)
                exports.infoList[allInfoIndex].info[index][whichStat] = resetTo
              }
            }
            output = ""
            if(found.length > 0){
              output += "The following characters had their "+whichStat+" reset: "
              for(let c of found){
                output += c+" "
              }
              output += "\n"
            }
            if(unfound.length > 0){
              output += "The following characters could not be found: "
              for(let c of unfound){
                output += c+" "
              }
              output += "\n"
            }
            message.channel.send(output)
            updateStorageMessage(message.guild.id)
          }
        }

      }
      else{
        message.channel.send(commandArgs[1]+" not recognized as a "+whichStat+" command.  Try add, remove, or reset.")
      }
    }

    if(commandArgs[0] == "combat")
    {
      exports.deck = new Deck();
      exports.combatants = []
      exports.round = 0
      for (let c of commandArgs.slice(1))
      {
        exports.combatants.push({'name': c})
      }
      var output = "Combat started with "
      for (let c of exports.combatants)
      {
        output += c.name+", "
      }
      message.channel.send(output)
      //message.channel.send(exports.deck.draw())
    }
    if(commandArgs[0] == "add")
    {
      if(commandArgs.length == 1){
        message.channel.send("Please enter name of new combatant.")
      }
      else{
        name = commandArgs[1]

        if(commandArgs.length == 2 || commandArgs[2] != "now"){
          message.channel.send(""+name+" added to next round.")
          exports.combatants.push({'name': name})
        }
        else{
          card = exports.deck.draw()
          if(card == false){
            message.channel.send("Deck shuffled because of lack of cards.")
            exports.deck.shuffle()
            card = exports.deck.draw()
          }
          exports.combatants.push({'name': name,'cards':[card]})
          output = displayInitiative(exports.combatants,exports.round)
          message.channel.send(output)
        }
      }
    }
    if(commandArgs[0] == "remove")
    {
      if(commandArgs.length == 1){
        message.channel.send("Please enter name of combatant(s) to remove.")
      }
      else{
        names = commandArgs.slice(1)
        namesRemoved = []
        namesNotRemoved = []
        for (let n of names){
          if(exports.combatants.map((x) => x.name).includes(n)){
            exports.combatants = exports.combatants.filter((x) => x.name != n)
            namesRemoved.push(n)
          }
          else{
            namesNotRemoved.push(n)
          }
        }
        if(namesRemoved.length > 0){
          output = "The following combatants were removed: "
          for (let n of namesRemoved){
            output += n+" "
          }
          message.channel.send(output)
        }
        if(namesNotRemoved.length > 0){
          output = "The following names were not found in combat: "
          for (let n of namesNotRemoved){
            output += n+" "
          }
          message.channel.send(output)
        }
      }
    }
    if(commandArgs[0] == "round")
    {
      if(exports.combatants.length == 0)
      {
        message.channel.send("Start combat with combatants before starting round.")
      }
      else {
        if(!exports.deck.jokers()){
          exports.deck.shuffle()
          message.channel.send("Deck shuffled before round because Joker drawn last round.")
        }
        if(exports.deck.getRemains.length < exports.combatants.length){
          exports.deck.shuffle()
          message.channel.send("Deck shuffled before round because deck lacked cards for every combatant.")
        }
        exports.round += 1
        for (let c of exports.combatants){
          c.cards = [exports.deck.draw()]
        }
        output = displayInitiative(exports.combatants,exports.round)
        message.channel.send(output)
      }
    }
    if(commandArgs[0] == "note")
    {
      if(commandArgs.length == 1)
      {
        message.channel.send("Please include which combatant and the note.")
      }
      else {
        recipient = commandArgs[1]
        note = ""
        if(commandArgs.length > 2){
          note = commandArgs.slice(2).join(" ")
        }
        if(exports.combatants.map((x) => x.name).includes(recipient)){
          loc = exports.combatants.findIndex((x) => x.name == recipient)
          exports.combatants[loc].note = note
          if(note.length == 0){
            delete exports.combatants[loc].note
          }
          output = displayInitiative(exports.combatants,exports.round)
          message.channel.send(output)
        }
        else{
          message.channel.send("Can't find combatant named "+recipient)
        }
      }
    }
    if(commandArgs[0] == "draw")
    {
      if(commandArgs.length == 1)
      {
        message.channel.send("Enter how many cards to draw then optionally who draws them.")
      }
      else {
        numDraws = Number(commandArgs[1])
        console.log(numDraws)
        if(isNaN(numDraws)){
          message.channel.send("First argument must be a number.")
        }
        else if(numDraws > 10){
          message.channel.send("You can't draw more than 10 cards at once.")
        }
        else if(commandArgs.length > 2 && !(exports.combatants.map((x) => x.name)).includes(commandArgs[2])){
          message.channel.send("No cards drawn because name not found in iniative.")
        }
        else{
          draws = []
          for(let i = 0; i < numDraws; i++){
            draw = exports.deck.draw()
            if(!draw){
              exports.deck.shuffle()
              draw = exports.deck.draw()
              message.channel.send("Deck shuffled because it ran out of cards.")
            }
            draws.push(draw)
          }
          if(commandArgs.length == 2){
            output = "Cards: "
            for(let c of draws) {
              output += c+" "
            }
            message.channel.send(output)
          }
          else{
            loc = exports.combatants.findIndex((x) => x.name == commandArgs[2])
            cards = exports.combatants[loc].cards
            for(let c of draws) {
              cards.push(c)
            }
            cards.sort((x,y) => ordinalCard(y) - ordinalCard(x))
            exports.combatants[loc].cards = cards
            output = displayInitiative(exports.combatants,exports.round)
            message.channel.send(output)
          }
        }
      }
    }
    if(commandArgs[0] == "current"){
      if(exports.combatants.length == 0)
      {
        message.channel.send("Start combat with combatants before checking round.")
      }
      else {
        output = displayInitiative(exports.combatants,exports.round)
        message.channel.send(output)
      }
    }
  }
})

// Log our bot in
bot.login(token);

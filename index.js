const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { token } = require("./config/token.json");
const edts = require("./config/edts.json");
const fetch = require("node-fetch");
const ical = require("ical");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.on("interactionCreate", async (interaction) => {

    if(!interaction.isCommand()) return;
    if(interaction.commandName != "edt") return;

    let groupe = interaction.options.get("groupe").value;
    
    let date = new Date();
    switch(interaction.options.get("date").value){
        case "tomorrow":
            date = getTomorrow();
            break;
        case "nextWorkingDay":
            date = getNextWorkingDay();
            break;
    }   

    let events = await getEventsOfDay(groupe, date);
    let embed = createEmbed(groupe,date,events);

    interaction.reply({embeds: [embed]});

});

function createEmbed(groupe, date, events){

    let embed = new EmbedBuilder()
    .setColor(0xff7779)
    .setTitle(":sparkles: EDT des "+groupe+" - "+date.toLocaleDateString());

    if(events.length > 0){
        events.forEach(event => {
        
            let start = new Date(event.start).toLocaleTimeString("fr-FR",{
                hour: "2-digit",
                minute: "2-digit"
            });
            
            let end = new Date(event.end).toLocaleTimeString("fr-FR",{
                hour: "2-digit",
                minute: "2-digit"
            });
    
            let summary = event.summary;
            let location = event.location.split(",")[0].substring(6);
    
            embed.addFields(
                {
                    name: ":clock2: "+start+" - "+end+(location != "" ? " :round_pushpin: "+location : ""),
                    value: summary+""
                }
            );
    
        });
    } else {
        embed.addFields(
            {
                name: ":clock2: 00:00 - 23:59 :round_pushpin: chez soi",
                value: "Dormir"
            }
        );
    }
    

    return embed;
}

function getTomorrow(){
    let date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
}

function getNextWorkingDay(){
    let date = new Date();

    do{
        date.setDate(date.getDate() + 1);
    } while (date.getDay() == 0 || date.getDay() == 6)

    return date;
}

async function getEventsOfDay(groupe, date){

    let link = edts[groupe];

    let response = await fetch(link);
    let text = await response.text();
    let events = Object.values(ical.parseICS(text));
    
    events.sort((a, b) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    let eventsAtDate = events.filter(e => new Date(e.start).toLocaleString().startsWith(date.toLocaleString().split(" ")[0]));
    
    return eventsAtDate;

}

const command = new SlashCommandBuilder()
.setName("edt")
.setDescription("Donne l'emploi du temps du prochain jour ouvr??")
.addStringOption(option => 
    option
    .setName("groupe")
    .setDescription("Nom du groupe d'??tudiants")
    .setRequired(true)
    .addChoices(
        {
            name: "Premi??re ann??e - TP11",
            value: "1A TP11"
        },
        {
            name: "Premi??re ann??e - TP12",
            value: "1A TP12"
        },
        {
            name: "Premi??re ann??e - TP21",
            value: "1A TP21"
        },
        {
            name: "Premi??re ann??e - TP22",
            value: "1A TP22"
        },
        {
            name: "Cr??ation Num??rique - Alternants",
            value: "CNA"
        },
        {
            name: "Cr??ation Num??rique - Initiaux",
            value: "CNI"
        },
        {
            name: "D??veloppement Web - Alternants",
            value: "DWA"
        },
        {
            name: "D??veloppement Web - Initiaux",
            value: "DWI"
        },
        {
            name: "Strat??gies de Communication - Alternants",
            value: "SCA"
        },
        {
            name: "Strat??gies de Communication - Initiaux",
            value: "SCI"
        }
    )
)
.addStringOption(option =>
    option
    .setName("date")
    .setDescription("Date de l'emploi du temps souhait??")
    .setRequired(true)
    .addChoices(
        {
            name: "Aujourd'hui",
            value: "today"
        },
        {
            name: "Demain",
            value: "tomorrow"
        },
        {
            name: "Prochain jour ouvr??",
            value: "nextWorkingDay"
        }
    )
);

client.once('ready', () => {

    client.application.commands.create(command);

    client.user.setPresence({
        activities: [
            {
                name: "/edt <groupe> <date>",
                type: 3
            }
        ],
        status: 'online'
    });
    
});

client.login(token);

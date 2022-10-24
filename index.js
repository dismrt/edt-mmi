const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const { token } = require("./config.json");
const fetch = require("node-fetch");
const ical = require("ical");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('messageCreate', async (message) => {

    if(client.user.id == message.author.id) return;
    if(!message.content.toLowerCase().startsWith("/edt ")) return;

    let args = message.content.split(" ");

    try{

        let groupe = args[1].toUpperCase();

        let date;
        if(args[2]){
            date = new Date(args[2].split("/").reverse().join("-"));
            if(date == "Invalid Date") throw "Date incorrecte !";
        } else {
            date = new Date();
        }

        let events = await getEventsOfDay(groupe, date);
        
        let embed = createEmbed(groupe, date, events);
        message.reply({embeds: [embed]});
    
    } catch(error) {

        let embed = createErrorEmbed(error);
        message.reply({embeds: [embed]});

    }
    
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

function createErrorEmbed(error){

    let embed = new EmbedBuilder()
    .setTitle("Erreur ! :cry:")
    .setDescription(error)
    .setColor(0xff0000);

    return embed;

}

const edtLinks = {
    DWA: "https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=4ce538de67834683cdf5f66defb05d57a5f10b982f9b914f8b3df9a16d82f4932a2c262ab3ba48506729f6560ae33af6fa8513c753526e332bda1edc491dcfab,1",
    DWI: "https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=c640d6546a8695a1bc4c51f8cf2836aba5f10b982f9b914f8b3df9a16d82f4932a2c262ab3ba48506729f6560ae33af6fa8513c753526e332bda1edc491dcfab,1",
    CNA: "https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=540e04c094d45b9d5eeb60c0f150dc9aa5f10b982f9b914f8b3df9a16d82f4932a2c262ab3ba48506729f6560ae33af6fa8513c753526e332bda1edc491dcfab,1",
    CNI: "https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=c5e87c356ff2413b22845c96abc5ea9ba5f10b982f9b914f8b3df9a16d82f4932a2c262ab3ba48506729f6560ae33af6fa8513c753526e332bda1edc491dcfab,1",
    SCA: "https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=de76c79cdeb3fcd475bb72daf4e0a13aa5f10b982f9b914f8b3df9a16d82f4932a2c262ab3ba48506729f6560ae33af6fa8513c753526e332bda1edc491dcfab,1",
    SCI: "https://www.emploisdutemps.uha.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data=5a3f4c20e5018d6c755d5993aa599ec0a5f10b982f9b914f8b3df9a16d82f4932a2c262ab3ba48506729f6560ae33af6fa8513c753526e332bda1edc491dcfab,1"
}

async function getEventsOfDay(groupe, date){

    let link = edtLinks[groupe];

    if(!link) throw "Ce groupe n'existe pas.";

    let response = await fetch(link);
    let text = await response.text();
    let events = Object.values(ical.parseICS(text));
    
    events.sort((a, b) => {
        return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

    let eventsAtDate = events.filter(e => new Date(e.start).toLocaleString().startsWith(date.toLocaleString().split(" ")[0]));
    
    return eventsAtDate;

}

client.once('ready', () => {
    client.user.setPresence({
        activities: [
            {
                name: "!edt <groupe> <date>",
                type: 3
            }
        ],
        status: 'online'
    });
});

client.login(token);

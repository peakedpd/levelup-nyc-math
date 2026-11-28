/* Cinematic dialogue lines (static, so every one is pre-recorded in the character's own voice: voice/<char>/*.mp3).
   Shared by cine3d.js (browser) and tools/voice_lines.js (node harvester). */
(function(root){
const CINE_LINES={
 okafor:{greet:"Good morning! Class is inside. Come on in!",start:"Ready? Here comes a math challenge!",win:"Here's your XP — great thinking!"},
 marcia:{start:"Ready? Here comes a math challenge!",win:"Here's your XP — great thinking!"},
 theo:{start:"Ready? Here comes a math challenge!",win:"Here's your XP — great thinking!"},
 sal:{greet:"Hey! Mr. Sal here. I used to teach at Level Up Academy. Now I run the Clothing Store. Press E to shop!",shop:"Great choice! Let's find you a new look — spend your City Coins."},
 worker:{greet:"Yo. Prize Corner's open. Tickets go here.",prizes:"What're we getting today? Pick a prize, any prize."},
 brock:{dare:"Nobody gets past The Block. Show me what you've got!",bonus:"Bonus round? Okay, partner. Let's see that trick again!",
  lose:"Ha! The Block stays blocked. Come back when you're ready!",slip:"Heh. Looks like it slipped a little. Rematch soon!",quit:"Leaving already? The Block will be right here."},
 muncher:{roar:"Roar! I munch numbers for breakfast! Solve my two step problems to stop me!"}
};
/* who-name -> voice key */
function voiceKey(who){who=String(who||"");if(/okafor/i.test(who))return "okafor";if(/marcia/i.test(who))return "marcia";if(/theo/i.test(who))return "theo";if(/sal\b/i.test(who))return "sal";
 if(/arcade worker|worker/i.test(who))return "worker";if(/brock|block/i.test(who))return "brock";if(/muncher/i.test(who))return "muncher";return "narrator"}
/* same text -> same key in node and the browser */
function voiceNorm(t){return String(t||"").replace(/^[\s"“]+|[\s"”]+$/g,"").toLowerCase().replace(/&/g," and ").replace(/[^a-z0-9]+/g," ").trim()}
const API={CINE_LINES,voiceKey,voiceNorm};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else Object.assign(root,API);
})(this);

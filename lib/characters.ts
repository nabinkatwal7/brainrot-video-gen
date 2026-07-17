export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  speakers: CharacterSpeaker[];
  defaultScript: string;
}

export interface CharacterSpeaker {
  name: string;
  voiceFile: string;
  characterImage: string;
  style: string;
}

export const CHARACTER_PRESETS: CharacterPreset[] = [
  {
    id: "family-guy",
    name: "Family Guy",
    description: "Peter & Stewie — the classic brainrot duo.",
    speakers: [
      { name: "Peter", voiceFile: "voice-peter.wav", characterImage: "Peter.png", style: "loud, impulsive, not very bright, enthusiastic" },
      { name: "Stewie", voiceFile: "voice-stewie.wav", characterImage: "Stewie.png", style: "sophisticated, sarcastic, big words, British accent" },
    ],
    defaultScript: `Peter: Hey Lois, look! I'm a comedian!
Stewie: Oh good Lord, here we go.
Peter: What's the deal with airline food? It's tiny!
Stewie: That's not even how jokes work, you imbecile.`,
  },
  {
    id: "breaking-bad",
    name: "Breaking Bad",
    description: "Walter White & Jesse Pinkman — the chemistry duo.",
    speakers: [
      { name: "Walter", voiceFile: "voice-walter.wav", characterImage: "walter-white.png", style: "serious, intense, methodical, teacher-like" },
      { name: "Jesse", voiceFile: "voice-jesse.wav", characterImage: "jesse-pinkman.png", style: "energetic, slang, emotional, yo" },
    ],
    defaultScript: `Walter: Jesse, we need to cook.
Jesse: Yo Mr. White, you sure about this?
Walter: Chemistry is about precision, Jesse.
Jesse: Yeah, yeah, I know. You're the danger.`,
  },
  {
    id: "gta-sa",
    name: "GTA San Andreas",
    description: "CJ — the iconic reluctant hero.",
    speakers: [
      { name: "CJ", voiceFile: "voice-cj.wav", characterImage: "cj-char.png", style: "street-wise, tired, reluctant, iconic" },
      { name: "CJ2", voiceFile: "voice-cj.wav", characterImage: "cj-char.png", style: "motivational, determined" },
    ],
    defaultScript: `CJ: Ah shit, here we go again.
CJ2: Come on CJ, stay focused!
CJ: I know, I know. But man, I'm tired.
CJ2: That's the life we chose, homie.`,
  },
  {
    id: "spongebob",
    name: "SpongeBob",
    description: "SpongeBob & Squidward — optimism vs misery.",
    speakers: [
      { name: "SpongeBob", voiceFile: "voice-spongebob.wav", characterImage: "spongebob-char.png", style: "optimistic, high-energy, naive" },
      { name: "Squidward", voiceFile: "voice-a.wav", characterImage: "squidward-char.png", style: "miserable, sarcastic, deadpan, annoyed" },
    ],
    defaultScript: `SpongeBob: I'M READY! I'M READY! I'M READY!
Squidward: Oh no. It's 6 AM and he's already at full volume.
SpongeBob: Hey Squidward! Wanna go jellyfishing?
Squidward: The last thing I want is to spend my day with you.`,
  },
  {
    id: "rick-morty",
    name: "Rick & Morty",
    description: "Rick Sanchez & Morty Smith — genius drunk grandpa and anxious grandson.",
    speakers: [
      { name: "Rick", voiceFile: "voice-b.wav", characterImage: "rick-char.png", style: "genius, drunk, burping, nihilistic, sarcastic" },
      { name: "Morty", voiceFile: "voice-a.wav", characterImage: "morty-char.png", style: "anxious, nervous, high-pitched, reluctant" },
    ],
    defaultScript: `Rick: Listen Morty, I need you to climb into this portal.
Morty: Aw jeez Rick, I don't know about this.
Rick: Don't be a baby Morty. It's fine, it's fine.
Morty: You said that last time and we almost died!
Rick: "Almost" is the key word, Morty. Almost.`,
  },
  {
    id: "big-bang",
    name: "Big Bang Theory",
    description: "Sheldon Cooper & Leonard Hofstadter — genius physicist and patient roommate.",
    speakers: [
      { name: "Sheldon", voiceFile: "voice-b.wav", characterImage: "sheldon-char.png", style: "arrogant, genius, socially clueless, pedantic" },
      { name: "Leonard", voiceFile: "voice-a.wav", characterImage: "leonard-char.png", style: "patient, sarcastic, resigned, long-suffering" },
    ],
    defaultScript: `Sheldon: Leonard, I've been thinking.
Leonard: That's always dangerous.
Sheldon: My spot on the couch is scientifically optimal.
Leonard: It's a spot on the couch, Sheldon.
Sheldon: It's 2.7 degrees cooler and has optimal TV viewing angles.`,
  },
  {
    id: "joey-chandler",
    name: "Joey & Chandler",
    description: "Joey Tribbiani & Chandler Bing — dumb himbo and sarcastic king.",
    speakers: [
      { name: "Joey", voiceFile: "voice-b.wav", characterImage: "joey-char.png", style: "dumb, hungry, ladies man, how you doin" },
      { name: "Chandler", voiceFile: "voice-a.wav", characterImage: "chandler-char.png", style: "sarcastic, witty, uses jokes to deflect" },
    ],
    defaultScript: `Joey: Hey Chandler, I'm hungry.
Chandler: When aren't you hungry?
Joey: Good point. Let's get pizza.
Chandler: We just ate an hour ago.
Joey: That was an appetizer. The real meal starts now.`,
  },
  {
    id: "ross-chandler",
    name: "Ross & Chandler",
    description: "Ross Geller & Chandler Bing — nerdy paleontologist and sarcastic best friend.",
    speakers: [
      { name: "Ross", voiceFile: "voice-b.wav", characterImage: "ross-char.png", style: "nerdy, whiny, dramatic, dinosaur obsessed" },
      { name: "Chandler", voiceFile: "voice-a.wav", characterImage: "chandler-char.png", style: "sarcastic, witty, hilarious, unimpressed" },
    ],
    defaultScript: `Ross: Did you know the T-Rex had tiny arms?
Chandler: Fascinating. Can we talk about something else?
Ross: But Chandler, that's the most interesting fact!
Chandler: The most interesting fact is that you're still single.
Ross: WE WERE ON A BREAK!`,
  },
  {
    id: "clarksons-farm",
    name: "Clarkson's Farm",
    description: "Jeremy Clarkson & Kaleb Cooper — clueless posh farmer and actual farmer.",
    speakers: [
      { name: "Jeremy", voiceFile: "voice-b.wav", characterImage: "jeremy-char.png", style: "loud, posh, clueless about farming, overconfident" },
      { name: "Caleb", voiceFile: "voice-a.wav", characterImage: "caleb-char.png", style: "dumbfounded, genuine farmer, confused by Jeremy" },
    ],
    defaultScript: `Jeremy: Right then Caleb, what's first on the agenda?
Caleb: Well... we need to plough the field, Mr. Clarkson.
Jeremy: Splendid! I'll take the tractor. How hard can it be?
Caleb: Oh no. No no no. Last time you broke the gate.
Jeremy: The gate was poorly designed! This is agriculture, not rocket science.`,
  },
];

export const REDDIT_STORY_PRESETS: CharacterPreset[] = [
  {
    id: "reddit-family-guy",
    name: "Reddit x Family Guy",
    description: "Peter reads a wild Reddit AITA post and reacts with Stewie.",
    speakers: [
      { name: "Peter", voiceFile: "voice-peter.wav", characterImage: "Peter.png", style: "loud, impulsive, reading Reddit out loud" },
      { name: "Stewie", voiceFile: "voice-stewie.wav", characterImage: "Stewie.png", style: "sophisticated, commenting sarcastically on the story" },
    ],
    defaultScript: `Peter: AITA for refusing to let my brother borrow my car?
Stewie: Oh this should be good. Let me guess, he crashed it.
Peter: No! He wanted to drive it to a date. But he's a terrible driver!
Stewie: So you said no and now your mother is involved, correct?
Peter: How did you know? Lois is yelling at me right now!
Stewie: Because I live in this house, you imbecile.`,
  },
  {
    id: "reddit-rick-morty",
    name: "Reddit x Rick & Morty",
    description: "Rick and Morty react to unhinged Reddit stories.",
    speakers: [
      { name: "Rick", voiceFile: "voice-b.wav", characterImage: "rick-char.png", style: "cynical, drunk, commenting on Reddit drama" },
      { name: "Morty", voiceFile: "voice-a.wav", characterImage: "morty-char.png", style: "shocked, horrified by the stories" },
    ],
    defaultScript: `Rick: Look at this AITA post Morty. This guy ate his roommate's food.
Morty: Aw jeez Rick, that's not that bad.
Rick: The roommate was saving it for his dead grandma's recipe contest.
Morty: Oh my god. That's horrible! What did he do?
Rick: He left a passive-aggressive note. Weak, Morty. Weak.`,
  },
];

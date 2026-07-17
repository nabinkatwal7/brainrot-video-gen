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
    description: "Peter & Stewie — the classic brainrot duo. Peter is loud and dumb, Stewie is sophisticated and sarcastic.",
    speakers: [
      { name: "Peter", voiceFile: "voice-peter.wav", characterImage: "Peter.png", style: "loud, impulsive, not very bright, enthusiastic" },
      { name: "Stewie", voiceFile: "voice-stewie.wav", characterImage: "Stewie.png", style: "sophisticated, sarcastic, uses big words, British accent" },
    ],
    defaultScript: `Peter: Hey Lois, look! I'm a comedian!
Stewie: Oh good Lord, here we go. Another one of your "comedy" routines.
Peter: What's the deal with airline food? It's tiny! I want a big steak!
Stewie: That's not even how jokes work, you monumental buffoon.
Peter: Hey, I got a laugh! I heard you giggling!
Stewie: That was a gasp of horror, you imbecile.`,
  },
  {
    id: "breaking-bad",
    name: "Breaking Bad",
    description: "Walter White & Jesse Pinkman — the chemistry duo. Walt is serious and intense, Jesse is energetic and slang-filled.",
    speakers: [
      { name: "Walter", voiceFile: "voice-walter.wav", characterImage: "walter-white.png", style: "serious, intense, methodical, teacher-like" },
      { name: "Jesse", voiceFile: "voice-jesse.wav", characterImage: "jesse-pinkman.png", style: "energetic, slang, emotional, yo" },
    ],
    defaultScript: `Walter: Jesse, we need to cook. The numbers don't lie.
Jesse: Yo Mr. White, you sure about this? Last time was intense, man.
Walter: Chemistry is about precision, Jesse. I am the one who knocks.
Jesse: Yeah, yeah, I know. You're the danger. Can we just get to work?
Walter: First, we need to discuss the purity. 99.1 percent is not enough.
Jesse: 99.1? That's like, A-plus in my book, man!`,
  },
  {
    id: "gta-sa",
    name: "GTA San Andreas",
    description: "CJ (Carl Johnson) — the iconic solo character. Perfect for motivational/reluctant meme content.",
    speakers: [
      { name: "CJ", voiceFile: "voice-cj.wav", characterImage: "cj-char.png", style: "street-wise, tired, reluctant, iconic" },
      { name: "CJ2", voiceFile: "voice-cj.wav", characterImage: "cj-char.png", style: "motivational, determined" },
    ],
    defaultScript: `CJ: Ah shit, here we go again. Every time I try to get out, they pull me back in.
CJ2: Come on CJ, you gotta stay focused! The Grove Street family needs you!
CJ: I know, I know. But man, I'm tired of all this running around.
CJ2: That's the life we chose, homie. You follow the train, you do the mission.
CJ: All you had to do was follow the damn train CJ!
CJ2: Don't remind me. Let's just get this over with.`,
  },
  {
    id: "spongebob",
    name: "SpongeBob SquarePants",
    description: "SpongeBob & best friend energy — optimistic and clueless meets sarcastic realism.",
    speakers: [
      { name: "SpongeBob", voiceFile: "voice-spongebob.wav", characterImage: "spongebob-char.png", style: "optimistic, high-energy, naive, enthusiastic" },
      { name: "Squidward", voiceFile: "voice-a.wav", characterImage: "squidward-char.png", style: "miserable, sarcastic, deadpan, annoyed" },
    ],
    defaultScript: `SpongeBob: I'M READY! I'M READY! I'M READY! Today is gonna be the best day ever!
Squidward: Oh no. It's 6 AM and he's already at full volume. Somebody end my misery.
SpongeBob: Hey Squidward! Wanna go jellyfishing with me? I packed snacks!
Squidward: The last thing I want to do is spend my day off with a porous yellow freak.
SpongeBob: I'll take that as a yes! Let me get my net!
Squidward: I didn't say yes. I explicitly said no. Why does nobody listen to me?`,
  },
];

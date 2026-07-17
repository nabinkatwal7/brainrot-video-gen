const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? null;
}

interface ScriptResult {
  script: string;
  error?: string;
}

export async function generateScript(topic: string): Promise<ScriptResult> {
  const apiKey = getApiKey();

  const prompt = `Generate a short, funny dialogue between Peter Griffin and Stewie Griffin from Family Guy about the topic: "${topic}".

Format each line EXACTLY like this:
Peter: <Peter's dialogue>
Stewie: <Stewie's dialogue>

Rules:
- Make it hilarious and in-character
- Peter should be loud, impulsive, and not very bright
- Stewie should be sophisticated, sarcastic, and use big words
- Keep it 6-10 lines total (3-5 exchanges)
- Make sure every line starts with "Peter:" or "Stewie:"
- No narration, no stage directions, no quotation marks`;

  if (apiKey) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 500 },
        }),
      });

      if (!response.ok) {
        const error = await response.text().catch(() => "");
        throw new Error(`Gemini API error (${response.status}): ${error.slice(0, 200)}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      const lines = text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => /^(Peter|Stewie):/i.test(l))
        .map((l: string) => l.replace(/^\*+/g, "").replace(/\*+$/g, "").trim());

      if (lines.length >= 2) {
        return { script: lines.join("\n") };
      }
    } catch (err) {
      console.error("Gemini API call failed, using fallback:", err);
    }
  }

  return generateFallbackScript(topic);
}

function generateFallbackScript(topic: string): ScriptResult {
  const templates = [
    `Peter: Hey, check it out! I was thinking about ${topic} and I've got some great ideas!
Stewie: Oh, this ought to be good. Do regale us with your half-baked theories, Father.
Peter: Hey, I'm serious! ${topic} is more important than people give it credit for!
Stewie: Is that so? And what, pray tell, makes you such an authority on the subject?
Peter: I read a thing! Well, I saw a picture. But it was a very informative picture!
Stewie: Remarkable. A picture. I'm convinced. Truly, the intellectual giant of Quahog speaks.`,
    `Peter: Lois, get in here! I just figured out everything about ${topic}!
Stewie: Heaven help us. What fresh insanity is this?
Peter: It's all about the fundamentals, Stewie! You gotta understand the basics of ${topic}!
Stewie: And you, a man who once tried to pay for groceries with Monopoly money, understand the basics?
Peter: That was different! That money had a little mustache guy on it! This is real stuff!
Stewie: I need a drink. And I'm an infant. That's how much this conversation warrants it.`,
    `Peter: Hey Stewie, you know what's cool? ${topic}. That's what's cool.
Stewie: Is this going somewhere, or are we simply stating obvious observations?
Peter: I'm getting there! So, ${topic} is like... it's like a chicken. Only different.
Stewie: A chicken. You're comparing ${topic} to a chicken. I need a new family.
Peter: No wait, hear me out! Chickens lay eggs, right? And ${topic} is about stuff happening!
Stewie: I believe I speak for everyone when I say that was the single worst analogy in human history.
Peter: YOU'RE a bad analogy!`,
  ];

  return { script: templates[Math.floor(Math.random() * templates.length)] };
}

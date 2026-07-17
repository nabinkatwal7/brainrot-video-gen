# Voices

Drop a 5-15 second mono/stereo WAV reference clip per character here. The TTS sidecar (XTTS v2)
clones whatever voice is in the sample — it has no built-in knowledge of any specific character.

`voice-a.wav` / `voice-b.wav` are placeholders synthesized locally with Windows' built-in SAPI
voices (David / Zira), purely so the pipeline can be tested end-to-end without sourcing any
outside audio. Replace them with your own reference clips — clean audio with minimal background
noise/music works best.

**Note on copyrighted characters**: if you want to clone a specific show's character voice (e.g.
Peter Griffin, Stewie), sourcing that reference clip is on you, and using it in anything beyond
personal/experimental use runs into real copyright/right-of-publicity risk. This app doesn't
care whose voice is in the file — that call is yours.

Filename (minus extension) is what shows up in the voice picker.

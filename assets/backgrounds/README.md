# Backgrounds

Drop looping vertical (9:16, e.g. 1080x1920) gameplay clips here — Minecraft parkour, Subway
Surfers, ball-drop, etc. The pipeline trims/loops whichever clip you pick to match the
narration length, so clips of any length work.

`placeholder-loop.mp4` is a generated (non-video, ffmpeg `gradients` filter) placeholder for
testing the pipeline without needing any download.

The other clips here were downloaded from [Pixabay](https://pixabay.com/videos/search/minecraft%20parkour/)
(Pixabay Content License — free for any use, no attribution required, no real "9:16 first-person
parkour" gameplay was available so it's a mix of styles):

- `minecraft-snow-mountain-gameplay.mp4` — actual Minecraft gameplay footage, snowy terrain (1920x1080, 36s)
- `minecraft-steve-green-screen-dance.mp4` — stylized 3D Steve model, green-screen loop (4K, 28s)
- `parkour-backflip-acrobat.mp4` — animated stickman parkour/backflip, not Minecraft (4K, 16s)
- `stickman-running-adventure.mp4` — stickman dodging obstacles, Subway-Surfers-style (1080p, 12s)

The pipeline scales+crops whatever's picked to 1080x1920, so horizontal clips like these get
center-cropped automatically. Add your own clips the same way — filename is shown as-is in the
picker, so name them descriptively.

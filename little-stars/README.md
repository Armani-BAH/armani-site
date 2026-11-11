# Emporio Armani · Little Stars

An in-store game for the Emporio Armani Kids activity. Children aged 5–12 pick the games they
want from a menu of six, with Stella the star as their guide. They can mix and match outfits,
design their own T-shirt or dress, collect stars, open a gift, and finish with a Little Star
badge and a printable certificate that can carry their photo. English and Arabic.
A child can finish after one game (about 1 minute) or play all six (about 6–8 minutes).

No login, no accounts, no leaderboard. Nothing a child does or types is saved anywhere.

---

## 1. What is in this folder

```
little-stars/
├── index.html                 The game page (open this)
├── README.md                  This guide
├── manifest.webmanifest       Lets the iPad install the game like an app
├── sw.js                      Keeps the game working without internet
├── css/style.css              All the design (colours, sizes, animations)
├── js/
│   ├── i18n.js                ALL the wording, English + Arabic  ← edit text here
│   ├── catalog.js             The list of product photos         ← edit photos here
│   ├── core.js                Shared parts (sound, cards, stars, confetti)
│   ├── mascot.js              Stella the star (the guide) and the T-shirt drawing
│   ├── app.js                 Game flow + Store Event Mode settings
│   └── games/
│       ├── stylist.js         1 · Little Armani Stylist
│       ├── memory.js          2 · Armani Memory Match
│       ├── quiz.js            3 · Little Fashion Quiz
│       ├── adventure.js       4 · Fashion Adventure
│       ├── challenge.js       5 · Little Star Challenge
│       ├── catch.js               · Star Catch bonus round (part of game 5)
│       ├── designer.js        6 · Mini Designer (mix & match on a figure)
│       └── studio.js              · Design a T-shirt or a dress (part of game 6)
├── assets/
│   ├── images/                48 Emporio Armani Kids product photos
│   │   ├── tops/  bottoms/  shoes/  accessories/  jackets/  dresses/
│   │   └── SOURCES.txt        Which catalogue piece each photo is
│   ├── logo/                  Emporio Armani logo
│   ├── icons/                 Home-screen icons
│   └── fonts/                 Bodoni Moda, Jost (English) and Tajawal (Arabic)
└── tools/build_offline_list.py   Only needed if you add or rename files
```

Everything is stored inside the folder. The game does not load anything from another website.

---

## 2. Try it on a computer

Double-click `index.html`. The game opens in your browser and is fully playable.
(Offline install only works once the game is on a web address — see step 3.)

---

## 3. Put it on the shop iPad

The iPad needs a web address to open. The simplest way is to place this folder inside your
existing website, so the game lives at:

**https://www.eawishlist.com/little-stars/**

1. Copy the whole `little-stars` folder into your `armani-site` folder (next to `index.html`).
2. Publish the site the same way you normally do (commit and push to GitHub).
3. Wait about two minutes, then open the address above on the iPad in **Safari**.

The page is marked "noindex", so it will not appear in Google.

### Make it full screen (recommended)

1. In Safari, tap the **Share** button (square with an arrow).
2. Tap **Add to Home Screen**, then **Add**.
3. Open the game from the new **Little Stars** icon. It now fills the screen with no address bar.
4. Open it once while on Wi-Fi. After that it also works without internet.

### Before the event

- Turn the iPad sideways (landscape). Portrait also works.
- Turn the volume up and switch off silent mode.
- Settings → Display & Brightness → Auto-Lock → **Never**.
- To stop children leaving the game: Settings → Accessibility → **Guided Access** → On.
  Open the game, triple-click the top (or Home) button, tap **Start**. Triple-click again to end.

---

## 4. Between children (Store Event Mode)

At the end of every game there are two large buttons:

| Button | What it does |
|---|---|
| **PLAY AGAIN** | Same child plays again. Stars go back to zero. |
| **NEW LITTLE STAR** | Next child. Returns to the welcome screen, everything cleared. |

The game also clears itself:

- Left alone for 90 seconds during a game → asks "Are you still playing?" → returns to the
  welcome screen after 25 more seconds.
- Results screen left alone for 3 minutes → returns to the welcome screen.

### Hidden staff menu

**Press and hold the Emporio Armani logo for 2 seconds** (top corner during a game, or the big
logo on the welcome screen). You get:

- **Reset for the next child** — stop the current game at any moment.
- **Skip to results** — jump to the badge and certificate.
- **Update the game (needs Wi-Fi)** — loads the newest version. Use this after any update.
- **Full screen on / off**
- **Close**

To change the waiting times, open `js/app.js`; the numbers are at the top under
"STORE EVENT MODE settings".

---

## 5. The certificate

1. On the results screen the child may type a first name (optional) and tap **Add my photo**
   (optional) to take a picture with the iPad camera. Then tap **MY CERTIFICATE**.
2. Tap **PRINT OR SAVE**.
   - **Print:** choose your AirPrint printer. It prints one A4 landscape page.
   - **Save as PDF:** in the print preview, pinch outwards on the page preview with two fingers,
     then tap **Share** → **Save to Files** (or send by AirDrop / WhatsApp).
3. Tap **BACK**, then **NEW LITTLE STAR**.

The name and the photo are shown on the certificate only. They stay on the iPad, are never sent
anywhere, and are erased as soon as the next game starts. Please ask a parent before taking a
child's photo. The first time, Safari may ask permission to use the camera: tap **Allow**.

---

## 6. Change or replace the product photos

**Swap a photo (easiest):** save your new photo with the *same file name* as the one you are
replacing, in the same folder inside `assets/images/`. Done.

- Best shape: portrait 4:5 (for example 640 × 800 pixels), `.jpg`.
- Best look: product on a white or very light background.
- Keep the type right: a photo in `shoes/` should still be shoes, because the quiz asks
  "which ones go on your feet?".

**Add a new photo:** put it in the right folder, then open `js/catalog.js` and add one line in
that section, for example:

```
'red-jacket':  { cat: 'jackets' },
```

(the name must match the file name without `.jpg`). Then run
`python tools/build_offline_list.py` once so the iPad also keeps the new photo offline.

**Colour-matching looks** (used by the Stylist game) are listed at the bottom of
`js/catalog.js` under `LS.LOOKS`.

**After any change on a live site:** open `sw.js` and change the `VERSION` value at the top to
anything new (the tool above does this for you). This tells the iPad to download the update.

---

## 7. Change the wording

Open `js/i18n.js`. English is in the first block, Arabic in the second. Change only the text
between the quotes on the right-hand side.

---

## 8. How the game works

| Step | What the child does |
|---|---|
| Welcome | Chooses English or العربية, taps START YOUR ADVENTURE |
| Age | Junior Little Stars (5–7) or Senior Little Stars (8–12) |
| Game menu | Six game cards. The child taps any game, in any order. Played games get a tick. **Get my reward** appears after the first game. The **Games** button in the top bar returns to the menu at any time. |
| 1 · Little Armani Stylist | Builds an outfit: matches colours, then picks shoes and a finishing touch. Tap or drag. |
| 2 · Armani Memory Match | Finds the pairs. Easy 6 cards, Medium 8, Hard 12 (chosen on the intro screen). |
| 3 · Little Fashion Quiz | Picture questions: jacket, sunny day, eagle logo, matching shoes, plus a zoomed-in "detective" question. |
| 4 · Fashion Adventure | Chooses an outfit, then finds shoes, an extra and a jacket. Ends on a runway with camera flashes. |
| 5 · Little Star Challenge | Four quick tasks, then a bonus round: slide a finger to catch falling stars. |
| 6 · Mini Designer | Chooses one: **mix & match** tops, bottoms, dresses, shoes and extras on a figure with arrows (or "Surprise me"), **design a T-shirt**, or **design a dress** (colour, pattern, stickers they can drag). |
| Gift | Taps a gift box three times to open it. |
| Reward | Total stars, a fun title (Super Stylist, Memory Master, Quiz Champion, Star Catcher or Dream Designer), confetti, badge, surprise message, certificate. |

**Stella the star** guides the child on every screen, cheers for right answers, and can be tapped
to make her spin. She is an original character drawn in code.

**The child's T-shirt or dress design** appears on the results screen and on the printed
certificate. Like the name, it is never saved and is erased when the next child starts.

**Juniors (5–7):** fewer choices, fewer cards and questions, no timers, instructions read aloud,
and a gentle hint after two wrong tries.
**Seniors (8–12):** more choices, more questions, two outfits to style, and a bonus star for
answering before the timer bar runs out in the final challenge.

**Stars:** 2 for a first-try answer, 1 after a retry, 1 per memory pair, 3 for a Mini Designer creation,
1 per star caught in the bonus round (gold stars count 3), 3 for finishing each mini-game, 5 for
finishing the adventure. There is no way to lose.

**Sound:** the music-note button (top corner) switches all sound on or off. The **Listen**
button reads the current instruction aloud using the iPad's own voice. Nothing plays before the
first tap. For Arabic speech, the iPad needs an Arabic voice
(Settings → Accessibility → Spoken Content → Voices → Arabic).

---

## 9. Good to know

- Tested by automated full playthroughs at iPad screen sizes (landscape and portrait, English
  and Arabic, both age groups). Please do one real run on the shop iPad before the event.
- Product photos are the Emporio Armani Kids FW26 pieces already used on eawishlist.com.
- Fonts are open-licence (licence files are in `assets/fonts/`).

export interface Movement {
  name: string;
  objective: string;
  explanation: string;
  steps: string[];
  tip: string;
  quiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  };
}

export interface CourseData {
  title: string;
  instrument_family: string;
  description: string;
  movements: Movement[];
}

export const courseData: Record<string, Movement[]> = {
  Strings: [
    {
      name: "Holding the bow",
      objective: "Find a relaxed, balanced bow grip that produces a clean tone.",
      explanation: "On a stringed instrument the bow is your voice — it is where the tone is actually born. The stick acts like a spring: weight from your arm flows down through the hand and into the hair, which grips the string and sets it vibrating. The frog (the weighted block at the base) is the bow's center of balance, so resting it in the web between thumb and index finger lets the stick pivot naturally. A tight, 'controlling' grip chokes that spring — the hair can't release smoothly and the tone turns scratchy. A loose but supported hold lets the bow do the work, which is why the best tone often feels like you are doing less, not more.",
      steps: ["Rest the frog in the web between thumb and index finger.", "Curl the other fingers naturally over the stick.", "Keep the wrist flexible, not locked.", "Draw the bow across an open string, middle to tip."],
      tip: "Tension kills tone — if your shoulder rises, shake it out and reset.",
      quiz: { question: "Where should the bow's frog rest?", options: ["On the tip of the bow", "In the web between thumb and index finger", "Under the chin", "Against the bridge"], answer: 1, explanation: "The frog sits in the web between the thumb and index finger for balance and control." }
    },
    {
      name: "Left-hand setup",
      objective: "Place the left hand so fingers drop from above.",
      explanation: "Think of the left hand as a set of hammers. Fingers produce the clearest, most in-tune notes when they drop from a small height onto the string — the fingertip lands with just enough weight to press the string to the fingerboard, then relaxes. To make that possible, the thumb acts as a gentle guide resting against the neck, not a clamp. If the thumb squeezes, the fingers stiffen and lose their spring. Keeping the elbow under the instrument lines the fingers up over the strings so they fall straight down, which is why good left-hand setup is really about geometry, not strength.",
      steps: ["Rest the thumb lightly on the neck.", "Curve fingers so tips land on the string.", "Tap each finger in turn without squeezing the neck.", "Keep the elbow under the instrument."],
      tip: "The left hand balances the violin; it doesn't grip it.",
      quiz: { question: "What keeps the instrument balanced on the neck?", options: ["The thumb gripping tightly", "The chin only", "The hand balancing — not gripping", "The shoulder pushing up"], answer: 2, explanation: "The left hand balances the instrument; a tight grip blocks finger freedom." }
    },
    {
      name: "First open strings",
      objective: "Draw a sustained, even tone on each open string.",
      explanation: "A good tone comes from balancing three things at once: bow speed, bow pressure (arm weight), and the contact point between hair and string. When the bow travels parallel to the bridge, the contact point stays steady and the string vibrates evenly — this is why 'straight bowing' is taught so early. Bowing too close to the bridge with too little speed makes a scratchy sound; too far from the bridge with too much speed sounds thin and shallow. A slow, full-length bow stroke on an open string is the simplest way to feel this triangle of tone, because your left hand isn't doing anything — all your attention can go to the right arm.",
      steps: ["Bow the G string slowly, full length.", "Match the same length on D, A, E.", "Keep the bow parallel to the bridge.", "Aim for one long, unbroken sound per stroke."],
      tip: "Slow bow = warm tone. Speed up only after the sound is even.",
      quiz: { question: "For an even tone, the bow should be…", options: ["Parallel to the bridge", "At a 45° angle to the bridge", "Touching the bridge", "Diagonal across the strings"], answer: 0, explanation: "A bow parallel to the bridge produces the most even, full tone." }
    },
    {
      name: "Finger patterns",
      objective: "Place first and second fingers to form a simple scale.",
      explanation: "On a string, every finger you put down shortens the vibrating part of the string, raising the pitch. The distance between two fingers determines whether you get a half step (the smallest gap in Western music) or a whole step (twice as wide). When you place the 1st finger on A to sound B, then add the 2nd finger for C#, the gap between B and C# is a whole step — that's what gives a major scale its bright, 'happy' quality. Training your fingers to feel these spacings is the real skill of intonation: your ear confirms it, but your hand learns the geography.",
      steps: ["Place 1st finger on A for B.", "Add 2nd finger for C#.", "Play B–C#–A as a mini pattern.", "Repeat descending."],
      tip: "Hum the note before you play it — your ear guides the finger.",
      quiz: { question: "Which finger plays B on the A string?", options: ["3rd", "1st", "4th", "Open string"], answer: 1, explanation: "The 1st finger on the A string sounds B." }
    },
    {
      name: "Your first melody",
      objective: "Combine open strings and fingers into a tune.",
      explanation: "A melody is just a sequence of notes given shape by rhythm and direction. When you repeat a short pattern on one string and then echo it on another, you are practicing the core skill of phrasing: taking a musical idea and moving it somewhere new. Playing through mistakes matters here because the brain learns melody as a continuous gesture, not as isolated notes. If you stop at every error, you practice stopping; if you keep the phrase moving, you practice music. Repetition is not busywork — it is how a pattern moves from your conscious fingers into muscle memory.",
      steps: ["Play the pattern from the last movement.", "Repeat it an octave lower on the D string.", "String the two patterns together.", "Perform it twice through without stopping."],
      tip: "Mistakes are fine; stopping mid-phrase is what to avoid.",
      quiz: { question: "If you make a mistake mid-phrase, you should…", options: ["Stop immediately", "Keep going through the phrase", "Start over from the top", "Put the instrument down"], answer: 1, explanation: "Keep the phrase flowing — you can fix the note next time through." }
    }
  ],
  Keys: [
    {
      name: "Sitting at the piano",
      objective: "Set up a balanced, alert posture at the keyboard.",
      explanation: "Piano tone comes from arm weight transferred through the fingers into the keys — not from finger strength. That only works if your body is aligned so weight can flow freely. Sitting on the front half of the bench keeps your core engaged, feet flat on the floor give you a stable base to push from, and forearms level with the keys keep the wrists neutral so the weight passes through without bending. If the bench is too low, your wrists drop below the keys and you end up pushing instead of dropping weight, which tires the hands and thins the tone. Posture at the piano is really an acoustic choice, not just a comfort one.",
      steps: ["Sit at the front half of the bench.", "Feet flat, forearms level with the keys.", "Relax shoulders, lengthen the spine.", "Reach the keys without leaning."],
      tip: "If your wrists are below the keys, the bench is too low.",
      quiz: { question: "Your forearms should be…", options: ["Above the keys", "Level with the keys", "Below the keys", "Resting on your lap"], answer: 1, explanation: "Forearms level with the keys keep wrists neutral and fingers free." }
    },
    {
      name: "Hand shape",
      objective: "Form a natural curved hand ready to play.",
      explanation: "The ideal piano hand is the one your hand makes on its own when relaxed and slightly closed — a natural arch with fingertips on the keys. This curved shape is mechanically efficient: each finger acts like a little pillar, so weight from the arm transfers straight down into the key without bending any joint sideways. Lifting from the knuckle keeps that pillar intact; lifting from the wrist collapses it. The wrist's job is to be a flexible bridge between arm and hand, not a lifting muscle. A collapsed wrist today is a injury warning, which is why teachers watch hand shape so closely.",
      steps: ["Let your hand rest, then gently close it.", "Place fingertips on the keys.", "Keep the wrist neutral and loose.", "Lift fingers from the knuckle, not the wrist."],
      tip: "A collapsed wrist today means pain tomorrow.",
      quiz: { question: "Where do you lift fingers from?", options: ["The wrist", "The knuckle", "The elbow", "The shoulder"], answer: 1, explanation: "Fingers lift from the knuckle; the wrist stays supportive, not active." }
    },
    {
      name: "Five-finger position",
      objective: "Play a five-note pattern with even fingers.",
      explanation: "The five-finger position (fingers 1–5 on five consecutive notes like C–D–E–F–G) is the piano's home base. It maps your five fingers onto a chunk of the keyboard so you can focus on evenness without navigating big leaps. Piano fingerings number the thumb as 1 through the pinky as 5, and this hand-span is reused in almost every piece you'll ever play. Practicing it slowly teaches the fingers to sound identical — same volume, same length, same attack — which is much harder than it looks, because each finger is a different length and strength. Evenness here is the foundation of everything later.",
      steps: ["Place fingers 1–5 on C–G.", "Play slowly, one finger at a time.", "Keep each note even in volume.", "Repeat up and down."],
      tip: "The thumb passes under; it doesn't lunge.",
      quiz: { question: "With fingers 1–5 on C–G, which finger plays G?", options: ["1st (thumb)", "3rd", "5th (pinky)", "2nd"], answer: 2, explanation: "The 5th finger (pinky) lands on G in the C–G five-finger position." }
    },
    {
      name: "First chords",
      objective: "Play a simple three-note chord.",
      explanation: "A chord is several notes sounded together, and the simplest, most common kind is the triad — three notes built by skipping a letter each time (C–E–G, for example). Played together, those three notes fuse into one rich sound. On the piano, a triad fits neatly under fingers 1, 3, and 5 because the hand's natural span matches that skip-a-note shape. The tone of a chord comes from dropping arm weight into all three keys at once, not from pushing each finger independently — pushing makes the chord sound hard and tense, while weight makes it ring.",
      steps: ["Hold fingers 1, 3, 5 on a C triad.", "Press all three keys together.", "Listen for a balanced sound.", "Lift cleanly and repeat."],
      tip: "Chords ring loudest when the arm drops weight, not when fingers push.",
      quiz: { question: "A C triad uses fingers…", options: ["1, 2, 3", "1, 3, 5", "2, 3, 4", "1, 4, 5"], answer: 1, explanation: "A root-position C triad uses fingers 1, 3, and 5." }
    },
    {
      name: "Your first melody",
      objective: "Turn five-finger patterns into a short tune.",
      explanation: "The pattern C–E–G–E–C isn't random — it is a broken chord, also called an arpeggio. Instead of playing the triad all at once, you spread it out in time, which turns a block of sound into a melody. This is one of the most common ways composers build tunes: take a chord and 'arpeggiate' it so the ear hears the harmony one note at a time. When you repeat the pattern up and then back down, you give it direction — a shape — which is what makes a sequence of notes feel like a phrase rather than a drill.",
      steps: ["Play C–E–G–E–C.", "Repeat stepping up then down.", "Add a chord at the end.", "Perform the phrase twice."],
      tip: "Sing the melody as you play — it keeps the phrasing alive.",
      quiz: { question: "The pattern C–E–G–E–C describes a…", options: ["Descending scale", "Broken chord up and down", "Rest", "Single repeated note"], answer: 1, explanation: "C–E–G outlines a C triad, returning down — a broken chord." }
    }
  ],
  Woodwinds: [
    {
      name: "Forming the embouchure",
      objective: "Shape the mouth to buzz or vibrate the reed.",
      explanation: "A woodwind reed is a tiny blade of cane (or plastic) that vibrates against the mouthpiece when air passes over it — that vibration is the sound source, just like a violin string. Your embouchure (the shape of your mouth and lips) controls how freely the reed can vibrate. The lower lip acts as a cushion the reed rests on, allowing it to flex; the corners of the mouth firm up to seal the air so it all goes through, not out the sides. Too much bite pinches the reed so it can't vibrate fully, producing a thin, tight tone. Firm corners, soft lip — that balance lets the reed speak freely.",
      steps: ["Roll the lower lip over the teeth.", "Rest the reed on the lower lip.", "Close the corners gently around the mouthpiece.", "Blow a steady, slow airstream."],
      tip: "A tight bite pinches the tone; aim for firm corners, soft lip.",
      quiz: { question: "The reed rests on the…", options: ["Upper lip", "Lower lip", "Tongue", "Teeth"], answer: 1, explanation: "The reed sits on the lower lip, which cushions and controls it." }
    },
    {
      name: "Breath support",
      objective: "Use the diaphragm to power a steady airstream.",
      explanation: "Wind playing is really air management. The diaphragm is a dome-shaped muscle below the ribs; when you breathe in it flattens and pulls air low into the belly, and when you breathe out it presses back up to push air out in a controlled stream. That control is what players call 'support' — not a tense squeeze, but a steady, pressurized airflow. What matters for tone is the speed and steadiness of the air, not how much of it there is. A slow, supported airstream makes a note speak evenly; an unsupported, puffy one makes the tone waver. Practicing long, even notes is really training the diaphragm to stay engaged.",
      steps: ["Breathe low, expanding the belly.", "Hiss out slowly to feel control.", "Sustain a single note at one volume.", "Lengthen the breath over time."],
      tip: "Airspeed, not air quantity, makes a note speak.",
      quiz: { question: "A steady tone is powered by the…", options: ["Throat", "Diaphragm", "Lips", "Nose"], answer: 1, explanation: "The diaphragm drives a supported, steady airstream." }
    },
    {
      name: "First notes",
      objective: "Produce clear, in-tune notes on the main register.",
      explanation: "Each woodwind has a 'sweet spot' register where the instrument responds most easily — usually the middle of its range. Producing a clear note there is a matter of matching three things: enough airspeed to keep the reed vibrating, an embouchure firm enough to focus the tone but loose enough to let it ring, and a steady airstream so the pitch doesn't sag. When the tone is thin or airy, the embouchure is the first suspect — usually too much lip pressure choking the reed. The instrument itself is rarely the problem in these early stages; it's almost always air, embouchure, or both.",
      steps: ["Play a single note with good tone.", "Add the neighboring note.", "Alternate between the two.", "Keep the sound full and connected."],
      tip: "If the tone is thin, check your embouchure before your air.",
      quiz: { question: "A thin tone usually points to a problem with the…", options: ["Embouchure before air", "Reed strength only", "Instrument key", "Music stand"], answer: 0, explanation: "Embouchure issues thin the tone first — check it before blaming air or reed." }
    },
    {
      name: "Tonguing",
      objective: "Start notes cleanly with the tongue.",
      explanation: "When you play several notes in a row, the air is constantly flowing — but you need a way to separate them into distinct notes rather than one long smear. That's the tongue's job. By lightly touching the tip of the reed (saying 'too'), you briefly stop the vibration, then release it so the note speaks cleanly. The key insight is that the tongue releases the air; it doesn't stop it. The airstream keeps moving the whole time, and the tongue just 'articulates' the boundary between notes. This is why tonguing should feel light and quick, not forceful — a heavy tongue thuds.",
      steps: ["Say 'too' into the mouthpiece.", "Tongue each note of a slow pattern.", "Keep the air moving between tonguings.", "Aim for crisp, even starts."],
      tip: "The tongue releases the air; it doesn't stop it.",
      quiz: { question: "Saying 'too' into the mouthpiece…", options: ["Stops the air", "Releases the air", "Raises the pitch", "Lowers the pitch"], answer: 1, explanation: "The tongue releases the airstream to start a note cleanly; it doesn't stop the air." }
    },
    {
      name: "Your first melody",
      objective: "Play a short phrase with clean articulation.",
      explanation: "A phrase is a musical sentence — it has a beginning, a direction, and an arrival. In a short melody, the longest or highest note is usually the 'destination' the phrase moves toward, and the notes leading up to it create tension that resolves when you arrive. Playing some notes tongued (separated) and others slurred (connected) gives the phrase texture, like consonants and vowels in speech. When you shape the phrase toward the long note rather than playing every note equally, the melody starts to sound like music instead of an exercise.",
      steps: ["Play a four-note pattern tongued.", "Repeat it slurred.", "Combine tongued and slurred.", "Perform twice through."],
      tip: "Phrase toward the long note — it's the destination.",
      quiz: { question: "You should shape the phrase toward the…", options: ["Shortest note", "Long note", "First note", "Rest"], answer: 1, explanation: "The long note is the phrase's destination — shape toward it." }
    }
  ],
  Brass: [
    {
      name: "Buzzing the lips",
      objective: "Buzz the lips freely before adding the mouthpiece.",
      explanation: "On a brass instrument, you are the reed. Your lips vibrate when air passes between them, and that vibration is what makes the sound — the instrument and mouthpiece only amplify and shape it. That's why every brass lesson starts with a free lip buzz: if you can't buzz a steady pitch with just your lips, the horn can't help you. The buzz is created by closing the lips gently (like saying 'mmm') and pushing air through so they flap together. If the buzz won't hold, the lips are too tight in the center — relax them and let the air do the work.",
      steps: ["Pucker, then buzz like a horse.", "Hold a steady buzz.", "Add the mouthpiece.", "Buzz a single pitch into it."],
      tip: "If the buzz won't hold, relax the center of the lips.",
      quiz: { question: "Before the mouthpiece, you should buzz the…", options: ["Fingers", "Lips", "Tongue", "Teeth"], answer: 1, explanation: "Brass tone begins with a lip buzz — the mouthpiece only amplifies it." }
    },
    {
      name: "Mouthpiece & breath",
      objective: "Produce a clear tone on the mouthpiece.",
      explanation: "The mouthpiece is a small cup that sits against your lips and focuses the buzz into the instrument. Playing just the mouthpiece (called a 'mouthpiece buzz') is a diagnostic tool: if your tone is clear on the mouthpiece alone, the problem isn't your embouchure or breath — it's somewhere in the instrument. A clear mouthpiece tone comes from a centered buzz, a steady airstream, and gentle lip pressure. If you push the mouthpiece hard into your lips to force a note, you squeeze the buzz and the tone goes dead. The air, not the push, is what makes brass sing.",
      steps: ["Place the mouthpiece gently on the lips.", "Take a low, full breath.", "Buzz a long, steady tone.", "Keep the sound centered."],
      tip: "Pressure mutes tone — let air do the work, not the push.",
      quiz: { question: "Clear tone comes mostly from…", options: ["Pushing hard on the lips", "A steady airstream", "Tightening the throat", "Pressing the valves"], answer: 1, explanation: "A warm, steady airstream — not lip pressure — produces a clear brass tone." }
    },
    {
      name: "First notes",
      objective: "Produce a clean note on the horn.",
      explanation: "When you attach the mouthpiece to the horn, the instrument becomes a resonator that amplifies specific pitches from your buzz. Brass instruments naturally produce a series of notes called the harmonic series — the open horn will ring most easily at certain pitches determined by its length. As a beginner, you start on the lowest, easiest note of that series and hold it steady. The transfer from mouthpiece to horn is direct: a clear, centered buzz becomes a clear, ringing note. If the horn note is fuzzy, go back to the mouthpiece — the buzz is almost always the issue.",
      steps: ["Insert the mouthpiece into the instrument.", "Play the open tone.", "Hold it steady and listen.", "Repeat until consistent."],
      tip: "A clear mouthpiece buzz means a clear horn note.",
      quiz: { question: "A clear mouthpiece buzz usually means…", options: ["A clear horn note", "A flat note", "No sound at all", "A sharp note"], answer: 0, explanation: "If the buzz is centered and clear, the horn note will be too." }
    },
    {
      name: "Changing pitch",
      objective: "Move between two notes using breath and lips.",
      explanation: "To change pitch on brass you combine two things: the speed of your air and the tension of your lips. Faster air and slightly tighter lips raise the pitch to the next note in the harmonic series; slower air and looser lips lower it. The reason 'faster air' beats 'squeezing the lips' is that airspeed is controllable and smooth, while squeezing tends to choke the buzz and kill the tone. Beginners often try to muscle pitch changes with lip pressure, which is why the tone cracks. Trusting the air keeps the tone full while the lips make small, delicate adjustments.",
      steps: ["Play the open note.", "Use lip tension to reach the next pitch.", "Alternate slowly.", "Keep the tone full between notes."],
      tip: "Faster air raises pitch more reliably than squeezing.",
      quiz: { question: "What raises pitch most reliably?", options: ["Squeezing the lips", "Faster air", "More lip pressure", "Closing the valves"], answer: 1, explanation: "Faster, focused air raises pitch more reliably than squeezing." }
    },
    {
      name: "Your first melody",
      objective: "String two or three notes into a phrase.",
      explanation: "Even with only two or three notes available at this stage, you can make music by giving the phrase a shape — repeating a note, stepping to a new pitch, and returning home. The 'home' note (the lowest open tone) functions as the tonic: it's the pitch the phrase wants to resolve back to, and landing on it at the end gives the phrase a sense of finish. Brass playing rewards patience above all: a warm, steady airstream sustained through the whole phrase is what makes those two or three notes sound musical instead of labored.",
      steps: ["Play the open note twice.", "Add a second pitch.", "Return to the first.", "Perform the phrase twice."],
      tip: "Brass rewards a warm, steady airstream above all else.",
      quiz: { question: "Brass rewards a warm, steady…", options: ["Airstream", "Posture only", "Valve tap", "Foot tap"], answer: 0, explanation: "A warm, steady airstream is the foundation of every brass skill." }
    }
  ],
  Percussion: [
    {
      name: "Holding the sticks",
      objective: "Find a balanced, relaxed stick grip.",
      explanation: "A drumstick is not a hammer you swing with your arm — it's a spring you let bounce. Every stroke works by the stick falling onto the drumhead and rebounding back up, and your grip exists to let that rebound happen freely while still steering the stick. The fulcrum is the pivot point (usually between thumb and index finger) where the stick balances; pinch there lightly and let the other fingers wrap loosely so they can follow the stick's motion. If you choke the stick (grip too tight), the rebound dies and every stroke becomes effort. The stick does the work; your hand just guides.",
      steps: ["Find the fulcrum point on the stick.", "Pinch lightly between thumb and index.", "Wrap the other fingers loosely.", "Let the stick rebound off the surface."],
      tip: "The stick is a spring — never choke the bounce.",
      quiz: { question: "The stick should be held so it can…", options: ["Stay rigid", "Rebound off the surface", "Lock in place", "Bend"], answer: 1, explanation: "A good grip lets the stick rebound — choking it kills the bounce." }
    },
    {
      name: "Single strokes",
      objective: "Play even alternating strokes.",
      explanation: "Single strokes (right-left-right-left) are the alphabet of drumming. The goal at this stage is not speed but evenness — every stroke the same volume, the same height, the same spacing in time. The reason evenness comes first is that the ear hears uneven strokes as a 'gallop,' and that unevenness is very hard to unlearn later. Matched grip (both hands holding the stick the same way) helps because it makes the two hands mirror each other, so a weakness in your non-dominant hand becomes obvious and can be corrected. Slow and even now means fast and clean later.",
      steps: ["Tap R-L-R-L slowly.", "Let each stroke rebound.", "Keep the heights matched.", "Gradually increase speed."],
      tip: "Evenness beats speed every time.",
      quiz: { question: "What matters more than speed?", options: ["Evenness", "Loudness", "Stick height only", "Wrist tension"], answer: 0, explanation: "Even, matched strokes are the foundation — speed comes after." }
    },
    {
      name: "First pattern",
      objective: "Play a simple repeated rhythm.",
      explanation: "Rhythm exists on two layers: the pulse (the steady underlying beat, like a heartbeat) and the rhythm (the pattern of notes placed against that pulse). A simple pattern of quarter notes is just the pulse made audible. Adding an accent — playing one note every four louder — creates a grouping, which is how the ear starts to feel 'one' as a downbeat. Counting out loud while you play ties your hands to a steady internal clock; without that, hands tend to rush or drag and you won't notice until the pattern falls apart. The pulse must stay constant even when the rhythm gets more interesting.",
      steps: ["Play steady quarter notes.", "Add an accent every four.", "Keep the pulse constant.", "Loop without drifting."],
      tip: "Count out loud until your hands agree with your voice.",
      quiz: { question: "To keep a constant pulse you should…", options: ["Count out loud", "Speed up gradually", "Watch the clock", "Hold your breath"], answer: 0, explanation: "Counting out loud keeps your hands locked to a steady pulse." }
    },
    {
      name: "Dynamics",
      objective: "Play the same pattern at different volumes.",
      explanation: "Dynamics (loud and soft) on a drum come from stroke height, not from how hard you push. A stroke that lifts the stick high before falling produces a loud note; a low stroke produces a soft one — and crucially, the tempo and the rhythm stay exactly the same. This is a physics trick: the stick's drop height determines how much energy hits the head, but the timing is set by when you release it. Practicing loud-to-soft with an unchanged pulse trains the hands to control volume independently of speed, which is what makes dynamic playing expressive rather than just louder or quieter.",
      steps: ["Play the pattern loudly.", "Play it softly with the same rhythm.", "Alternate loud and soft.", "Keep tempo identical."],
      tip: "Stroke height controls volume — raise or lower the stick.",
      quiz: { question: "Volume is controlled by…", options: ["Stroke height", "Stick color", "Drum size only", "Posture"], answer: 0, explanation: "Higher stroke height = louder; lower = softer. The tempo stays the same." }
    },
    {
      name: "Your first beat",
      objective: "Combine patterns into a groove.",
      explanation: "A groove is what happens when steady patterns layer together and create a feel you can move to. The magic isn't in any single note — it's in the space and timing between them. When one hand plays quarters and another adds eighths, the two layers interlock, and the slight pull between them (whether you play perfectly on, slightly ahead, or slightly behind the pulse) is what musicians call 'feel.' A groove that breathes in the spaces feels alive; one with no gaps feels mechanical. That's why listening matters as much as playing: the groove is something you hear before you can write it down.",
      steps: ["Play quarters on one hand.", "Add eighths on the other.", "Layer them together.", "Loop the groove steadily."],
      tip: "A groove lives in the space between the notes.",
      quiz: { question: "A groove lives in the…", options: ["Space between the notes", "Loudest note", "First note only", "Drum brand"], answer: 0, explanation: "The feel of a groove comes from the spacing and timing between notes." }
    }
  ],
  Voice: [
    {
      name: "Breath & posture",
      objective: "Set up the body for free singing.",
      explanation: "The voice is the only instrument that is the body itself, so how you stand and breathe literally shapes your sound. Singing is powered by air, and the most efficient breath is a low, 'belly' breath driven by the diaphragm — the muscle below the ribs that flattens to draw air in and presses up to push it out. A tall, aligned posture (spine long, shoulders released, feet grounded) lets that breath move freely; tension anywhere — a raised shoulder, a clenched jaw, a locked knee — shortens the breath and thins the tone. Before any sound comes out, you are already tuning the instrument by setting up the body.",
      steps: ["Stand tall, feet shoulder-width.", "Breathe low into the belly.", "Release the jaw and tongue.", "Sigh out on a comfortable pitch."],
      tip: "Tension anywhere shortens the breath everywhere.",
      quiz: { question: "For free singing, you breathe…", options: ["Into the chest", "Low into the belly", "Through the nose only", "Shallow and quick"], answer: 1, explanation: "Low, belly breathing supports a free, sustained tone." }
    },
    {
      name: "Finding pitch",
      objective: "Match a given pitch cleanly.",
      explanation: "Matching pitch is a feedback loop between your ear and your vocal cords. Your ear hears a target pitch, your brain imagines it, and your vocal cords (two small muscles in the larynx) stretch or relax to vibrate at that exact frequency. When singers 'go off pitch,' the cause is almost never a bad ear — it's usually breath support faltering, because steady air is what keeps the vocal cords vibrating at a stable frequency. That's why humming first helps: it simplifies the task to just pitch, without the extra variables of words and vowels, so the ear-cord loop can lock in.",
      steps: ["Listen to the pitch.", "Hum it first.", "Open to an 'ah' vowel.", "Hold it steady."],
      tip: "If you drift, check breath, not ear.",
      quiz: { question: "If you drift off pitch, first check the…", options: ["Breath", "Microphone", "Sheet music", "Shoes"], answer: 0, explanation: "Pitch drift usually comes from breath support, not from hearing." }
    },
    {
      name: "Vowel shapes",
      objective: "Form clean vowels that carry tone.",
      explanation: "Your mouth and throat are a resonating chamber, and the shape of that chamber — set mostly by your tongue and jaw — determines which frequencies are amplified. That's what vowels are: different shapes of the resonator that color the same pitch differently. An open, tall 'ah' creates a large, open chamber that lets the tone ring; a tight, spread vowel shrinks the space and pinches the sound. Good singers keep the space inside the mouth generous even on bright vowels like 'ee,' which is why a trained voice sounds full and ringing across every word, not just the open ones.",
      steps: ["Sing 'ah' open and tall.", "Move to 'oh', then 'ee'.", "Keep the jaw relaxed.", "Match volume across vowels."],
      tip: "Space inside the mouth makes a voice ring.",
      quiz: { question: "What makes a voice ring?", options: ["Space inside the mouth", "Volume alone", "Posture only", "The room"], answer: 0, explanation: "Open, shaped space inside the mouth lets the tone ring." }
    },
    {
      name: "First phrase",
      objective: "Sing a short melodic phrase in tune.",
      explanation: "A musical phrase is like a spoken sentence: it has a direction and a point. In a short ascending phrase, the highest note is usually the emotional peak — the moment the phrase is moving toward — and the notes after it release that energy as the phrase comes home. Shaping the phrase means giving that peak a little more weight and letting the other notes lead toward it, rather than singing every note with equal effort. This is called 'phrasing,' and it's what turns correct notes into expressive singing. The breath, the vowel, and the direction of the line all serve it.",
      steps: ["Sing three notes ascending.", "Return down.", "Keep the tone connected.", "Repeat twice."],
      tip: "Shape the phrase toward the highest note.",
      quiz: { question: "You should shape the phrase toward the…", options: ["Highest note", "Lowest note", "Rest", "First word"], answer: 0, explanation: "Directing energy toward the highest note gives the phrase shape and direction." }
    },
    {
      name: "Your first melody",
      objective: "Sing a full short tune.",
      explanation: "Singing a complete melody ties together everything: breath, pitch, vowel, and phrasing. The trick is to keep a steady pulse underneath so the melody has rhythm, and to treat the words — even when you simplify to a single vowel — as a story with shape and meaning. Humming the melody first builds the pitch map in your ear; adding the vowel keeps the resonance consistent; then the dynamics and phrasing give it life. A melody well-sung feels inevitable, as if it could only go one way — that's the sign that all the elements are working together.",
      steps: ["Hum the whole melody.", "Sing it on 'ah'.", "Add the words.", "Perform twice through."],
      tip: "Tell the story of the words, even on a single vowel.",
      quiz: { question: "Even on a single vowel, you should…", options: ["Tell the story", "Sing louder", "Stop between notes", "Change the melody"], answer: 0, explanation: "Phrasing and storytelling carry the melody, not just the words." }
    }
  ],
  Theory: [
    {
      name: "The staff",
      objective: "Read pitch on the five-line staff.",
      explanation: "The five-line staff is the map that tells a musician which pitch to play and when. Each line and space represents a specific note, and the clef at the beginning tells you which pitches those are. In treble clef, the lines from bottom to top are E-G-B-D-F (mnemonic: Every Good Boy Does Fine), and the spaces spell F-A-C-E. Once you know the landmarks — middle C, the top line F, the space below the staff — you can read any note by measuring its distance from the nearest landmark. Reading music is not memorizing every note; it's knowing the system well enough to find any note quickly.",
      steps: ["Identify the five lines and four spaces.", "Learn the treble clef line names.", "Learn the space names.", "Practice finding notes from landmarks."],
      tip: "Mnemonics are scaffolding — soon you'll read shapes, not names.",
      quiz: { question: "The lines of the treble clef are…", options: ["E-G-B-D-F", "F-A-C-E", "C-D-E-F-G", "A-B-C-D-E"], answer: 0, explanation: "Treble clef lines, bottom to top: E-G-B-D-F." }
    },
    {
      name: "Rhythm values",
      objective: "Understand note durations.",
      explanation: "Rhythm is how we organize time in music. The beat is the steady pulse — like a heartbeat — and every note value is a fraction of that beat. A quarter note lasts one beat; a half note lasts two; a whole note lasts four. Eighth notes divide the beat in half, sixteenths in four. When you see a piece of music, the time signature at the beginning tells you how many beats are in each measure and which note value gets one beat. Reading rhythm is really about feeling the relationship between durations — a half note isn't just 'two beats,' it's 'twice as long as a quarter.'",
      steps: ["Clap a steady beat.", "Clap quarter notes, then half notes.", "Mix quarters and eighths.", "Read a simple rhythm."],
      tip: "The beat is the steady ground; notes are footsteps placed on it.",
      quiz: { question: "The beat is the…", options: ["Steady ground", "Loudest note", "End of the song", "Rest"], answer: 0, explanation: "The beat is the steady ground; notes are footsteps placed on it." }
    },
    {
      name: "Scales",
      objective: "Build a major scale.",
      explanation: "A scale is an ordered sequence of notes that defines a key — a tonal 'home base.' The major scale, the most common in Western music, follows a specific pattern of whole and half steps: W-W-H-W-W-W-H. Starting on C, that gives you C-D-E-F-G-A-B-C — no sharps or flats. The half steps fall between the 3rd and 4th notes (E-F) and the 7th and 8th notes (B-C). Every major scale in every key follows this same pattern, which is why learning the pattern is more useful than memorizing individual scales — you can build any scale from any starting note.",
      steps: ["Start on C.", "Follow the W-W-H-W-W-W-H pattern.", "Play the scale up and down.", "Try starting on G."],
      tip: "Major scale half-steps: between 3–4 and 7–8 (W-W-H-W-W-W-H).",
      quiz: { question: "A major scale's half-steps fall between…", options: ["3–4 and 7–8", "1–2 and 5–6", "2–3 and 6–7", "4–5 and 7–8"], answer: 0, explanation: "Major scale half-steps: between 3–4 and 7–8 (W-W-H-W-W-W-H)." }
    },
    {
      name: "Intervals",
      objective: "Name the distance between two notes.",
      explanation: "An interval is the distance between two pitches, and it's the foundation of how we hear and describe music. The smallest interval in Western music is the half step (semitone); a whole step is two half steps. Intervals have both a size (a number, like '3rd') and a quality (major, minor, perfect, etc.). A major 3rd sounds bright; a minor 3rd sounds darker. Training your ear to recognize intervals is what lets you hear a melody and know what's happening — not by naming every note, but by feeling the distances between them. Trained ears recognize intervals instantly, before naming them.",
      steps: ["Play a half step.", "Play a whole step.", "Play a major 3rd.", "Play a perfect 5th."],
      tip: "Sing the interval — your ear knows before your brain does.",
      quiz: { question: "Trained ears recognize intervals…", options: ["Instantly, before naming them", "Only after writing them", "Only on paper", "Never"], answer: 0, explanation: "Trained ears recognize intervals instantly, before naming them." }
    },
    {
      name: "Your first chord",
      objective: "Build and identify a triad.",
      explanation: "A triad is a three-note chord built by stacking thirds — skip one letter name each time. Starting on C, you get C-E-G: C to E is a third, and E to G is a third. The bottom note is the root (the foundation), the middle is the third (which determines major or minor), and the top is the fifth (which stabilizes the chord). A major triad has a major third on the bottom and a minor third on top; a minor triad reverses that. Every chord is a story — the root is the setting, the third is the character, and the fifth is the ground it stands on.",
      steps: ["Play C-E-G as a block chord.", "Play it as a broken chord (arpeggio).", "Try it starting on G.", "Resolve it back to the root."],
      tip: "Every chord is a story — the root is the setting.",
      quiz: { question: "In a triad, the root is the…", options: ["Setting of the story", "Climax", "Dissonance", "Ending"], answer: 0, explanation: "The root is the foundation — the 'setting' the chord is built on." }
    }
  ]
};

export const courseTitles: Record<string, string> = {
  Strings: "First Notes on Strings",
  Keys: "First Notes on Keys",
  Woodwinds: "First Notes on Woodwinds",
  Brass: "First Notes on Brass",
  Percussion: "First Notes on Percussion",
  Voice: "First Notes on Voice",
  Theory: "First Notes on Theory",
};

export const courseDescriptions: Record<string, string> = {
  Strings: "From holding the bow to your first melody — five movements that build the foundations of string playing.",
  Keys: "From sitting at the piano to your first melody — five movements that build the foundations of keyboard playing.",
  Woodwinds: "From forming the embouchure to your first melody — five movements that build the foundations of woodwind playing.",
  Brass: "From buzzing the lips to your first melody — five movements that build the foundations of brass playing.",
  Percussion: "From holding the sticks to your first beat — five movements that build the foundations of drumming.",
  Voice: "From breath and posture to your first melody — five movements that build the foundations of singing.",
  Theory: "From the staff to your first chord — five movements that build the foundations of music theory.",
};

export const instrumentFamilies = ["All", "Strings", "Keys", "Woodwinds", "Brass", "Percussion", "Voice", "Theory"];

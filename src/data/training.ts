export interface TrainingQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface TrainingModule {
  title: string;
  objective: string;
  explanation: string;
  keyPoints: string[];
  doDont: { do: string; dont: string };
  scenario: { situation: string; response: string };
  reflection: string;
  questions: TrainingQuestion[];
}

export const trainingModules: TrainingModule[] = [
  {
    title: 'Building Trust with a Child',
    objective: 'Establish a safe, welcoming relationship so the child feels comfortable learning from you.',
    explanation:
      'Children learn best from adults they trust. Trust is not built by authority or expertise — it is built through consistency, warmth, and respect. In an online lesson, the child sees you through a screen, so every small signal matters: your tone of voice, whether you smile, whether you remember what they told you last week. A child who feels seen and safe will take risks, make mistakes, and keep trying. A child who feels judged or rushed will shut down. Before you teach a single note, your first job is to make the child believe you are genuinely glad to be there with them.',
    keyPoints: [
      'Greet the child by name at the start of every lesson and ask about something personal (their week, a pet, school).',
      'Use a warm, unhurried tone — speak slightly slower than you think you need to.',
      'Remember details from previous lessons and refer back to them. This signals: I see you, I know you.',
      'Let the child see you make a small mistake and laugh it off. It gives them permission to be imperfect.',
      'End every lesson with a specific, genuine compliment about something they did well.',
    ],
    doDont: {
      do: 'Start each lesson with 1–2 minutes of non-music conversation to ease the child in.',
      dont: 'Jump straight into exercises or corrections the moment the call connects.',
    },
    scenario: {
      situation:
        'A 9-year-old student joins the video call and is visibly quiet, barely making eye contact. When you ask how their week was, they shrug and say "fine."',
      response:
        'Don\'t push. Say something warm and low-pressure: "That\'s okay — you don\'t have to talk about it. I\'m just glad you\'re here. I was thinking about what we worked on last time — you played that scale so much better. Ready to try it again?" Meet them where they are, not where you expect them to be.',
    },
    reflection:
      'Think about a teacher or mentor who made you feel safe as a learner. What specifically did they do? How can you recreate that for your student?',
    questions: [
      {
        question: 'What should you do at the start of every lesson to build trust?',
        options: [
          'Jump straight into scales to establish structure',
          'Greet the child by name and ask about something personal',
          'Review last week\'s homework to show you\'re tracking progress',
          'Ask the child to play something so you can assess where they are',
        ],
        correctIndex: 1,
      },
      {
        question: 'Why should you let the child see you make a small mistake during a lesson?',
        options: [
          'It shows you\'re not a perfectionist',
          'It tests whether the child notices errors',
          'It gives them permission to be imperfect',
          'It keeps the lesson light and entertaining',
        ],
        correctIndex: 2,
      },
      {
        question: 'What should you avoid doing the moment the video call connects?',
        options: [
          'Greeting the child by name',
          'Asking about their week',
          'Jumping straight into exercises or corrections',
          'Smiling and making eye contact',
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    title: 'Communicating at the Child\'s Level',
    objective: 'Adapt your language, pace, and examples so a child can understand and stay engaged.',
    explanation:
      'Children are not small adults. Their attention spans are shorter, their vocabulary is smaller, and they process abstract ideas differently. A phrase like "support the phrase toward the climax" means nothing to an 8-year-old — but "make this note the loudest, like you\'re shouting to your friend across a field" makes it click instantly. The best teachers for children are not the most knowledgeable musicians; they are the most skilled translators. Your job is to take complex musical concepts and dress them in language, images, and games that fit the child\'s age and world.',
    keyPoints: [
      'Use analogies from the child\'s world: animals, sports, food, school, video games.',
      'Keep instructions to one sentence. If you need two, the instruction is too complex.',
      'Check for understanding by asking the child to explain it back to you in their own words.',
      'Vary your tone and energy — a monotone voice loses a child\'s attention in under a minute.',
      'Break a 30-minute lesson into 3–4 short activities (5–8 minutes each), not one long exercise.',
    ],
    doDont: {
      do: 'Replace jargon with images: "keep your wrist loose" becomes "pretend your hand is a bird resting on water."',
      dont: 'Use adult musical vocabulary (phrasing, articulation, intonation) without immediately translating it.',
    },
    scenario: {
      situation:
        'A 7-year-old keeps gripping the bow too tightly. You\'ve said "relax your hand" three times and nothing changes.',
      response:
        'Stop giving the same instruction. Instead, try a physical image: "Hold the bow like it\'s a baby bird — if you squeeze, the bird gets hurt, but if you hold it gently, it can fly." Have them practice holding and releasing the bow without playing. The image does what the instruction couldn\'t.',
    },
    reflection:
      'Pick one musical concept you teach often. How would you explain it to a 6-year-old? A 10-year-old? A 14-year-old? Try writing three different versions.',
    questions: [
      {
        question: 'How long should an instruction for a child be?',
        options: [
          'No more than two paragraphs',
          'One sentence — if you need two, it\'s too complex',
          'Three to five sentences with context',
          'As long as needed to fully explain the concept',
        ],
        correctIndex: 1,
      },
      {
        question: 'How can you check whether a child has understood what you taught?',
        options: [
          'Ask them to explain it back to you in their own words',
          'Have them write it down in a notebook',
          'Move on and see if they apply it correctly later',
          'Give them a short quiz at the end of the lesson',
        ],
        correctIndex: 0,
      },
      {
        question: 'What should you do when using adult musical vocabulary like "articulation" or "intonation"?',
        options: [
          'Avoid those terms entirely until the child is a teenager',
          'Use them freely — children will learn by exposure',
          'Immediately translate them into images the child can understand',
          'Write them on a whiteboard so the child can study them',
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    title: 'Keeping a Child Engaged',
    objective: 'Maintain focus and enthusiasm throughout the lesson using variety, play, and positive reinforcement.',
    explanation:
      'Children lose focus not because they don\'t care, but because their brains are wired for novelty. A lesson that is all instruction and no play feels like school — and for many children, school is the last place they want to be after school. The most effective music lessons weave play, games, and creative moments into the learning. This doesn\'t mean the lesson is unserious; it means the seriousness is disguised. A child who is laughing is also listening. A child who is playing a game is also practicing. Your task is to design the lesson so the child doesn\'t realize how much they\'re learning.',
    keyPoints: [
      'Alternate between focused work and playful breaks (e.g., 5 minutes of scales, then a 1-minute "silly sound" game).',
      'Turn repetitions into games: "Can you play it 3 times in a row without a mistake? I\'ll count."',
      'Let the child choose between two options sometimes — agency keeps engagement high.',
      'Celebrate small wins visibly: a high five (even on screen), a cheer, a sticker chart.',
      'Watch for the "glaze" — when eyes go distant, change the activity immediately. Don\'t push through.',
    ],
    doDont: {
      do: 'Notice when attention is fading and switch activities before the child disengages completely.',
      dont: 'Force a child to continue an exercise they\'ve clearly lost interest in — redirect instead.',
    },
    scenario: {
      situation:
        'Halfway through the lesson, your 10-year-old student starts looking around the room, fidgeting, and giving one-word answers.',
      response:
        'Stop and reset. "Hey, I can see your brain needs a break. Let\'s do something different for a minute." Play a call-and-response game, ask them to play something they love, or let them pick the next activity. A 2-minute reset saves the rest of the lesson.',
    },
    reflection:
      'What were you doing the last time a child was visibly excited during a lesson? What made that moment work? How can you create more of those moments?',
    questions: [
      {
        question: 'What should you do when you notice a child\'s eyes going distant during a lesson?',
        options: [
          'Speak louder to get their attention back',
          'Change the activity immediately — don\'t push through',
          'Remind them to pay attention and sit up straight',
          'Give them a short break and resume the same exercise',
        ],
        correctIndex: 1,
      },
      {
        question: 'Why should you let the child choose between two options sometimes during a lesson?',
        options: [
          'It saves you from having to plan every activity',
          'It tests whether they prefer certain exercises',
          'Agency keeps engagement high',
          'It helps you learn their musical taste',
        ],
        correctIndex: 2,
      },
      {
        question: 'What should you do when a child has clearly lost interest in an exercise?',
        options: [
          'Force them to finish it so they learn persistence',
          'Redirect to a different activity instead of forcing them to continue',
          'End the lesson early since they\'re not engaged',
          'Offer a reward for completing the exercise',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    title: 'Handling Frustration and Mistakes',
    objective: 'Help a child navigate frustration without losing confidence or motivation.',
    explanation:
      'Learning an instrument is hard. Every child will hit a wall — a passage they can\'t play, a note they can\'t reach, a day when nothing sounds right. How you respond in that moment shapes whether the child keeps going or wants to quit. The instinct to say "you\'re doing great, just try again" is well-meaning but can feel dismissive — the child knows they\'re struggling, and pretending they\'re not can make them feel unseen. Instead, name the difficulty honestly, normalize it, and break the problem into a piece small enough to succeed at. A child who overcomes a small piece of a hard thing learns resilience. A child who is told everything is fine learns nothing.',
    keyPoints: [
      'Name the feeling: "That was frustrating, wasn\'t it? That passage is genuinely hard."',
      'Normalize struggle: "Every musician I know struggled with this. It\'s not you — it\'s just hard."',
      'Break the problem down: isolate one measure, one note, one finger — make it small enough to win.',
      'Point to progress, not perfection: "Last week you couldn\'t play this at all. Today you got three notes right."',
      'Never let a lesson end on a failure. Always find something to succeed at before you say goodbye.',
    ],
    doDont: {
      do: 'Acknowledge the frustration first, then redirect to a smaller, achievable goal.',
      dont: 'Say "it\'s easy, you\'ll get it" — this tells the child that their struggle is a personal failing.',
    },
    scenario: {
      situation:
        'A 12-year-old student breaks down in tears after failing to play a passage they\'ve been working on for weeks. They say "I\'m just bad at this."',
      response:
        'Pause. Let them feel it — don\'t rush to fix. Then say: "I hear you. And I want you to know something: you\'re not bad at this. You\'re at the hard part, and the hard part is where everyone wants to quit. The difference between people who play music and people who don\'t isn\'t talent — it\'s that the people who play didn\'t quit at this exact moment. Let\'s take this one note at a time. Just the first note. Let\'s make that one beautiful."',
    },
    reflection:
      'Think about a time you struggled to learn something and wanted to quit. What did you need to hear in that moment? What would have helped you stay?',
    questions: [
      {
        question: 'What is the first thing you should do when a child is visibly frustrated?',
        options: [
          'Tell them "it\'s easy, you\'ll get it" to build confidence',
          'Name the feeling honestly — "That was frustrating, wasn\'t it?"',
          'Immediately break the passage into smaller pieces',
          'Move on to a different piece to avoid the frustration',
        ],
        correctIndex: 1,
      },
      {
        question: 'Why should you avoid saying "it\'s easy, you\'ll get it"?',
        options: [
          'It sets unrealistic expectations for the child',
          'It tells the child that their struggle is a personal failing',
          'It makes the child dependent on praise',
          'It doesn\'t give them specific technical advice',
        ],
        correctIndex: 1,
      },
      {
        question: 'What should you always do before ending a lesson where a child struggled?',
        options: [
          'Assign extra practice so they can master it before next time',
          'Find something for them to succeed at before you say goodbye',
          'Remind them that struggle is normal and leave it at that',
          'Give them a simpler version of the same passage to work on',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    title: 'Creating a Safe and Inclusive Space',
    objective: 'Ensure every child feels welcome, respected, and free to be themselves regardless of background.',
    explanation:
      'The children we serve come from many different backgrounds, families, and circumstances. Some may have never had an adult listen to them before. Some may be navigating challenges at home that you will never know about. Your lesson may be the most stable, kind, and attentive 30 minutes of their week. This is a responsibility, not a burden — it means your tone, your patience, and your openness matter more than you can measure. A safe space is one where the child knows they will not be judged, rushed, or compared to anyone else. It is built through small, consistent actions: pronouncing their name correctly, not assuming anything about their home life, and treating every question as a good question.',
    keyPoints: [
      'Learn and use the child\'s preferred name and pronouns. If you\'re unsure, ask gently.',
      'Never compare a student to another student ("your sister could play this by now").',
      'Avoid assumptions about the child\'s home, resources, or family situation.',
      'If a child shares something personal, listen without fixing. Your job is to be a safe adult, not a counselor.',
      'Be mindful of cultural references in your analogies — not every child plays sports, celebrates the same holidays, or has a backyard.',
    ],
    doDont: {
      do: 'Ask open, respectful questions and let the child share at their own pace.',
      dont: 'Make assumptions about what a child has access to at home (instruments, quiet space, parental help).',
    },
    scenario: {
      situation:
        'A student mentions they can\'t practice between lessons because they don\'t have a quiet space at home. You sense embarrassment in their voice.',
      response:
        'Respond without surprise or pity: "That\'s totally okay — lots of people don\'t have a quiet space. We\'ll make the most of our time together right now. If you ever find even 5 quiet minutes, here\'s something tiny you could try." Remove the shame, keep the door open, and adjust your expectations so the child never feels like they\'re failing for circumstances beyond their control.',
    },
    reflection:
      'What is one assumption you might carry into a lesson that a child from a different background would not recognize? How can you check that assumption at the door?',
    questions: [
      {
        question: 'What should you do if you\'re unsure about a child\'s pronouns?',
        options: [
          'Use the pronouns from their enrollment form and don\'t bring it up',
          'Ask gently',
          'Default to "they/them" until corrected',
          'Ask the parent rather than the child',
        ],
        correctIndex: 1,
      },
      {
        question: 'What is your role when a child shares something personal with you?',
        options: [
          'Listen without fixing — your job is to be a safe adult, not a counselor',
          'Offer practical advice to help them solve the problem',
          'Report it to the coordinator immediately',
          'Redirect the conversation back to the lesson',
        ],
        correctIndex: 0,
      },
      {
        question: 'Which of the following is an assumption you should avoid making about a child?',
        options: [
          'That they enjoy music and want to learn',
          'That they have access to an instrument, quiet space, and parental help at home',
          'That they are a beginner when they say they are',
          'That they prefer online lessons',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    title: 'Structuring an Effective Lesson',
    objective: 'Plan and deliver a lesson that balances review, new material, and fun in a way that keeps the child growing.',
    explanation:
      'A good lesson has a shape — it is not a random sequence of exercises. The structure gives the child a sense of where they are and where they\'re going, which builds confidence. A reliable 30-minute structure: start with something the child already does well (warm-up and confidence boost), move to the main new concept or piece (the growth zone), then end with something fun and creative (the reward). This arc — familiar, challenging, joyful — mirrors how children naturally learn through play. You don\'t need to plan every minute, but you should know the three things you want to touch before the lesson starts, and you should always be ready to abandon the plan if the child\'s energy demands it.',
    keyPoints: [
      'Open with a 3–5 minute warm-up the child can succeed at easily.',
      'Spend 10–15 minutes on the main new concept or piece.',
      'Reserve 5 minutes for creative play: improvising, making up a tune, or a game.',
      'Close with a 2-minute recap: "Here\'s what we did today, and here\'s what to try before next time."',
      'Write down what you covered and what to work on next — this continuity is what makes lessons compound over time.',
    ],
    doDont: {
      do: 'Plan three touchpoints for each lesson and stay flexible on the order and time.',
      dont: 'Wing the entire lesson with no plan — children sense when a teacher is unprepared and it erodes trust.',
    },
    scenario: {
      situation:
        'You\'ve planned to work on a new scale, but the student arrives excited about a song they heard and want to learn it.',
      response:
        'Follow their energy. "That\'s amazing — let\'s try it!" Use the song as the vehicle for the scale. Find the scale notes inside the melody, teach it through the song they\'re excited about, and you\'ve accomplished your goal through their motivation instead of against it. The best lesson plan is the one the child doesn\'t know is a plan.',
    },
    reflection:
      'If you had 30 minutes with a new student tomorrow, what three things would you plan? Now imagine the student arrives tired and distracted — how would you adjust?',
    questions: [
      {
        question: 'What should you open the lesson with?',
        options: [
          'The most challenging material while the child is fresh',
          'A 3–5 minute warm-up the child can succeed at easily',
          'A review of last week\'s homework and corrections',
          'A new piece to spark interest right away',
        ],
        correctIndex: 1,
      },
      {
        question: 'What should you do at the end of each lesson?',
        options: [
          'Introduce a new concept to think about before next time',
          'A 2-minute recap of what you did and what to try before next time',
          'Ask the child to evaluate their own performance',
          'Give the parent a progress report',
        ],
        correctIndex: 1,
      },
      {
        question: 'What should you do if a student arrives excited about a song they want to learn instead of what you planned?',
        options: [
          'Stick to your plan and save the song for another week',
          'Follow their energy and use the song as the vehicle for what you planned to teach',
          'Let them play the song first, then return to your original plan',
          'Tell them they need to master the scale before learning songs',
        ],
        correctIndex: 1,
      },
    ],
  },
];

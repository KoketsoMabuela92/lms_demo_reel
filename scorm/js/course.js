const COURSE = {
  id: "say-it-clearly",
  title: "Say It Clearly",
  blurb:
    "A ten-minute course on feedback conversations. One pattern, one practice dialogue, and a short check.",
  minutes: 10,
  level: "Foundational",
  audience: "People who rely on peers, and people who lead them",
  modules: [
    { id: "orient", num: "01", title: "Orient", slides: ["welcome", "objectives"] },
    { id: "pattern", num: "02", title: "The pattern", slides: ["misses", "clear", "contrast"] },
    { id: "practice", num: "03", title: "Practice", slides: ["scenario"] },
    { id: "check", num: "04", title: "Check", slides: ["quiz"] },
    { id: "close", num: "05", title: "Close", slides: ["reflect", "summary"] },
  ],
  slides: [
    {
      id: "welcome",
      short: "Welcome",
      type: "welcome",
      kicker: "Course",
      title: "Say It Clearly",
      body: "Feedback is a work skill, not a personality trait. This course gives you one pattern for a conversation you need to have this week.",
      points: [
        { label: "Time", value: "10 minutes" },
        { label: "Practice", value: "1 conversation" },
        { label: "Check", value: "3 questions" },
      ],
      note: "Adults decide quickly whether a course respects their time. This screen states the payoff, the duration, and that progress is saved. Nothing else.",
    },
    {
      id: "objectives",
      short: "Objectives",
      type: "objectives",
      kicker: "By the end",
      title: "What you will be able to do",
      items: [
        "Spot a verdict, a pile-on, and a delay before you speak.",
        "Build a note with context, one example, a question, and a check.",
        "Choose a response that keeps the standard and the person in the conversation.",
      ],
      note: "Each objective is a performance, not a topic. The practice conversation and the knowledge check are written backward from these three lines.",
    },
    {
      id: "misses",
      short: "Three habits",
      type: "cards",
      kicker: "Before the model",
      title: "Three ways feedback goes wrong",
      prompt: "Open each habit. These are the moves the practice conversation will test.",
      cards: [
        {
          id: "verdict",
          title: "The verdict",
          teaser: "A label, not a fact",
          body: "“You are careless.” The person now has to defend who they are, so the work never gets discussed.",
        },
        {
          id: "pile",
          title: "The pile-on",
          teaser: "Five issues, one sitting",
          body: "A list feels thorough to the speaker and foggy to the listener. One example is enough to change the next attempt.",
        },
        {
          id: "delay",
          title: "The delay",
          teaser: "Saved for the review",
          body: "By the quarterly conversation the detail is gone. Feedback works when the example is still visible to both people.",
        },
      ],
      note: "These three habits are the weak moves available in the scenario. Meeting them first gives the later feedback somewhere to land.",
    },
    {
      id: "clear",
      short: "CLEAR",
      type: "model",
      kicker: "A checklist, not a script",
      title: "Five ingredients",
      body: "Use the letters to check that a conversation has what it needs. You do not have to say them in this order. Context and one example almost always come first. Listen before you prescribe.",
      steps: [
        {
          id: "C",
          name: "Context",
          say: "Yesterday, in the client deck.",
          why: "Place the moment so they do not have to guess which incident you mean.",
        },
        {
          id: "L",
          name: "Listen",
          say: "What did you see happen?",
          why: "Their view first. You learn the constraint you were about to ignore.",
        },
        {
          id: "E",
          name: "Example",
          say: "Slide 4 still had the March figures.",
          why: "One fact a camera could have caught. No trait. No always.",
        },
        {
          id: "A",
          name: "Ask",
          say: "What would you do on the next send?",
          why: "They generate the fix. Advice is a backup, not the opening.",
        },
        {
          id: "R",
          name: "Result",
          say: "Let us look at Thursday’s deck together at 2.",
          why: "A time and a check. Otherwise it was only a conversation.",
        },
      ],
      note: "CLEAR is a job aid. Teaching it as a rigid spoken order would produce a stiff dialogue nobody will use on a real Thursday.",
    },
    {
      id: "contrast",
      short: "Contrast",
      type: "contrast",
      kicker: "Worked example",
      title: "Same moment, two deliveries",
      body: "A client deck went out with last month’s figures. Both people raise it the same day. Only one leaves the other person able to respond.",
      weak: {
        label: "Hard to use",
        quote: "You always send the wrong numbers. It is embarrassing for the team.",
        notes: ["A trait, not a fact", "Always is bigger than the incident", "The feeling lands. The fix does not."],
      },
      strong: {
        label: "Usable",
        quote:
          "In yesterday’s client deck, slide 4 still had the March figures. I want to understand the check you used before the next send. Can we walk through it?",
        notes: ["Context: yesterday’s deck", "Example: slide 4, March figures", "Listen: asks to walk through the check"],
      },
      note: "A contrast pair teaches the discrimination the quiz will test: trait versus fact, verdict versus question. The usable line is one someone could say out loud.",
    },
    {
      id: "scenario",
      short: "Conversation",
      type: "scenario",
      kicker: "Practice",
      title: "The late join",
      body: "This is practice. You will see the effect of each response, and you can replay the other opening.",
      note: "The first choice branches. A clear opening leads to agreeing a result. A verdict or a delay leads to a repair. Feedback describes the effect of the move. Paths are marked strong or revise, because a live conversation is not a single correct sentence.",
    },
    {
      id: "quiz",
      short: "Knowledge check",
      type: "quiz",
      kicker: "Check",
      title: "Three questions",
      body: "Answer all three, then submit. You can retry. The record keeps your best score.",
      note: "One discrimination per item, each matched to an objective. Feedback runs after the set so the learner commits to an answer. Retry stays on, and the home screen keeps the best score.",
    },
    {
      id: "reflect",
      short: "Your week",
      type: "reflect",
      kicker: "Transfer",
      title: "One conversation this week",
      body: "Name the person, and the single fact you will bring. This note stays in this browser. It is not sent anywhere.",
      prompt: "Who is it, and what fact will you use?",
      placeholder: "Alex, Thursday standup. The deck went out with March figures.",
      note: "A named person and a single fact is the smallest transfer task that is still real. It is optional, and it never leaves the device.",
    },
    {
      id: "summary",
      short: "Close",
      type: "summary",
      kicker: "Close",
      title: "You have the pattern",
      body: "Context. One example. A question. A time to check. That is the whole course.",
      note: "The close restates the objectives, shows the practice and the score, and only then opens the record. The record is marked as a demo so it cannot be read as an accredited certificate.",
    },
  ],
  scenario: {
    nodes: {
      late: {
        id: "late",
        speaker: "Situation",
        line: "You lead the account. Sam, a peer, joined the client call 15 minutes late. It is the second time this month. The client asked where Sam was. Sam is back at their desk.",
        prompt: "What do you say?",
        choices: [
          {
            id: "verdict",
            text: "You’re late again. The client clocked it. Don’t let it happen on Thursday.",
            tone: "revise",
            feedback:
              "You named the stakes, which matters. You also opened with a judgment, so the likely reply is an excuse, not a plan. A fact plus a question would have kept the conversation on the work.",
            next: "repair",
          },
          {
            id: "clear",
            text: "Have you got five minutes? On today’s call you joined at 10:15, and the client asked where you were. What got in the way?",
            tone: "strong",
            feedback:
              "This is a clear opening. The context is today’s call. The example is a time and a client reaction, not a label. You asked before you prescribed. Sam can answer without climbing out of a hole.",
            next: "follow",
          },
          {
            id: "delay",
            text: "I’ll leave it for now and raise the pattern in Friday’s retro.",
            tone: "revise",
            feedback:
              "A retro is a poor first home for a specific miss. The detail goes stale, and Sam hears it in public. Private and soon keeps the example sharp.",
            next: "repair",
          },
        ],
      },
      follow: {
        id: "follow",
        speaker: "Sam",
        line: "The 9:30 ran long. I meant to message and I didn’t.",
        prompt: "What do you lock in?",
        choices: [
          {
            id: "policy",
            text: "Then build a buffer. This is the second time, and I need it to stop.",
            tone: "revise",
            feedback:
              "The buffer is a fair expectation. It landed as a warning, with no agreed check. The conversation still needs a result: what Sam will do, and when you will look again.",
            next: null,
          },
          {
            id: "result",
            text: "Thanks for telling me. For Thursday, what will you do if the 9:30 overruns, and when should I check that you have a plan?",
            tone: "strong",
            feedback:
              "You treated the reason as information, not a pardon. Then you asked Sam to name the next action and a time to confirm it. That is what makes the feedback usable on Thursday.",
            next: null,
          },
          {
            id: "soften",
            text: "No worries. These calls always run over.",
            tone: "revise",
            feedback:
              "This protects the moment and drops the standard. Sam still has no plan, and the client still noticed. Warmth can stay. The example and the next step still have to be said.",
            next: null,
          },
        ],
      },
      repair: {
        id: "repair",
        speaker: "Situation",
        line: "Sam has gone quiet and is packing up. You still need the conversation.",
        prompt: "How do you reopen?",
        choices: [
          {
            id: "double",
            text: "Sam. The lateness is becoming a problem. We need to talk now.",
            tone: "revise",
            feedback:
              "“Becoming a problem” is another verdict, and “now” removes what little choice Sam had. A repair still uses a fact and a bounded ask.",
            next: null,
          },
          {
            id: "reopen",
            text: "Sam, before you go — five minutes tomorrow at 9? I want to talk about today’s call, specifically joining at 10:15, and what we do for Thursday.",
            tone: "strong",
            feedback:
              "You repaired without pretending the first pass was fine. You offered a time, one example, and a forward point. Sam can show up ready instead of braced.",
            next: null,
          },
          {
            id: "drop",
            text: "Leave it. I’ll cover with the client myself.",
            tone: "revise",
            feedback:
              "Covering the client may be necessary. It does not replace the conversation with Sam. The pattern stays, and you become the only person holding it.",
            next: null,
          },
        ],
      },
    },
  },
  questions: [
    {
      id: "q1",
      prompt: "Which line gives feedback on an observable fact?",
      options: [
        { id: "a", text: "You are not reliable with clients." },
        { id: "b", text: "You do not take the account seriously." },
        { id: "c", text: "You joined the client call at 10:15, and the client asked where you were." },
      ],
      answer: "c",
      why: "A fact is something a recording would show. The other lines judge the person, so they have to defend themselves instead of talking about the call.",
    },
    {
      id: "q2",
      prompt: "What does Listen ask you to do?",
      options: [
        { id: "a", text: "Ask what the other person saw before you add your view." },
        { id: "b", text: "Read out the company value on respect." },
        { id: "c", text: "Wait a week so the emotion cools." },
      ],
      answer: "a",
      why: "Listen is their account of this incident, before you prescribe. A value statement and a delay both skip the example.",
    },
    {
      id: "q3",
      prompt: "Sam explains the late join. Which reply agrees a result?",
      options: [
        { id: "a", text: "Thanks. Try not to let it happen again." },
        {
          id: "b",
          text: "Thanks. For Thursday, what will you do if the earlier call overruns, and when should we confirm?",
        },
        { id: "c", text: "Thanks. I’ll take the next call so you don’t have to worry." },
      ],
      answer: "b",
      why: "A result names the next action and a time to check. “Try not to” has no check. Taking the call yourself removes Sam from the work.",
    },
  ],
};

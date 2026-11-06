// Content of the Damia workspace (Figma "damia-case-study", bbyGbZ3b8P2uT84Pul9qu7, section 21:788): the sources a
// user works from, the connectors, the conversation with Damia and the outputs Studio creates. In memory only.

export type SourceKind = 'doc' | 'slides' | 'pdf';
export const kindLabel = (kind: SourceKind) => ({ doc: 'Document', slides: 'Slides', pdf: 'PDF' })[kind];

export interface Source {
  id: string;
  title: string;
  kind: SourceKind;
  pages: number;
  selected: boolean;
  /** 0–100 while Damia reads a new source; 100 = ready. */
  progress: number;
  summary: string;
  topics: string[];
  body: string[];
}

export interface Connector {
  id: string;
  name: string;
  description: string;
  linked: boolean;
}

export type NoteKind = 'note' | 'overview' | 'process' | 'slides' | 'proposal';
/** The outputs Studio can create (every note kind except a plain note). */
export type Creation = Exclude<NoteKind, 'note'>;
export const CREATION_LABEL: Record<Creation, string> = { overview: 'Overview', process: 'Process map', slides: 'Slide deck', proposal: 'Proposal' };

/** What a created output contains, so Studio can show it as the real thing (a map, a deck, a document). */
export type Artifact =
  | { kind: 'overview'; summary: string; topics: string[]; highlights: { sourceId: string; title: string; point: string }[]; nextSteps: string[] }
  | { kind: 'process'; goal: string; steps: { title: string; description: string; owner: string }[] }
  | { kind: 'slides'; slides: { title: string; bullets: string[] }[] }
  | { kind: 'proposal'; preparedFor: string; sections: { title: string; text: string }[]; costs: { item: string; qty: string; cost: string }[]; total: string };

export interface Message {
  id: string;
  role: 'user' | 'damia';
  text: string;
  /** The first source the answer points to ("File name" chip in the reference). */
  sourceId?: string;
  /** Every source the answer cites, shown as chips under it. */
  sourceIds?: string[];
  agent?: string;
  /** Number of sources the answer was grounded on. */
  basedOn?: number;
  /** An output Damia created from the conversation; the message links to it in Studio. */
  noteId?: string;
  /** What Damia offers to make next from this answer. */
  followUps?: { label: string; kind: Creation }[];
}

export interface Note {
  id: string;
  kind: NoteKind;
  title: string;
  body: string; // HTML for the editor
  artifact?: Artifact;
  /** Number of sources the output was created from. */
  basedOn?: number;
}

const body = (topic: string) => [
  `${topic} is introduced with everyday examples before the formal definition, so the idea lands before the maths.`,
  'Section 1. Key terms. Force, mass and acceleration are defined with their SI units and the symbols used in the rest of the text.',
  'Section 2. Worked examples. Three problems move from a single object to two interacting objects, each with a free-body diagram.',
  'Section 3. Check your understanding. Five short questions with answers at the end of the chapter.',
];

export const initialSources: Source[] = [
  { id: 's1', title: 'Action and Reaction', kind: 'slides', pages: 18, selected: true, progress: 100, summary: 'Every force comes in a pair: when one object pushes another, the second pushes back with an equal force in the opposite direction.', topics: ['Third law', 'Force pairs', 'Rockets'], body: body('Action and reaction') },
  { id: 's2', title: 'Balanced and Unbalanced Forces', kind: 'doc', pages: 6, selected: true, progress: 100, summary: 'Balanced forces leave motion unchanged; an unbalanced force changes speed or direction.', topics: ['Net force', 'Equilibrium', 'Free-body diagrams'], body: body('Balanced and unbalanced forces') },
  { id: 's3', title: 'Elemental Physics, Third Edition', kind: 'pdf', pages: 312, selected: true, progress: 100, summary: 'A reference textbook covering mechanics, energy and waves, with worked problems for each chapter.', topics: ['Mechanics', 'Energy', 'Waves', 'Problem sets'], body: body('Mechanics') },
  { id: 's4', title: 'Forces At Play', kind: 'doc', pages: 4, selected: true, progress: 100, summary: 'Contact and non-contact forces in sport, from a footballer’s kick to the friction of running shoes.', topics: ['Contact forces', 'Gravity', 'Sport'], body: body('Forces in sport') },
  { id: 's5', title: 'Friction Frenzy: Exploring Resistance', kind: 'doc', pages: 5, selected: true, progress: 100, summary: 'Static and kinetic friction, what affects them, and why ice and rubber behave so differently.', topics: ['Static friction', 'Kinetic friction', 'Surfaces'], body: body('Friction') },
  { id: 's6', title: 'Gravity’s Grip: The Force That Shapes Us', kind: 'slides', pages: 22, selected: true, progress: 100, summary: 'Gravity from falling apples to planetary orbits, and how weight differs from mass.', topics: ['Weight vs mass', 'Orbits', 'Free fall'], body: body('Gravity') },
  { id: 's7', title: 'Inertia In Action: Everyday Physics', kind: 'slides', pages: 14, selected: true, progress: 100, summary: 'Why passengers lurch forward when a bus brakes, and other everyday cases of the first law.', topics: ['First law', 'Inertia', 'Seat belts'], body: body('Inertia') },
  { id: 's8', title: 'Momentum Mania: Investigating Motion', kind: 'doc', pages: 7, selected: true, progress: 100, summary: 'Momentum, impulse and collisions, with a lab activity using trolleys on a track.', topics: ['Momentum', 'Impulse', 'Collisions'], body: body('Momentum') },
  { id: 's9', title: 'Newton’s Three Laws of Motion', kind: 'doc', pages: 9, selected: true, progress: 100, summary: 'The three laws stated, explained and applied, with one experiment per law.', topics: ['First law', 'Second law', 'Third law'], body: body('Newton’s laws') },
];

/** "Suggested Documents" in the reference: one click adds a starter source. */
export const SUGGESTED_DOCS = ['SOP', 'Policy', 'Templates', 'Customer Persona Template', 'Competitive Analysis Doc', 'ROI Calculator'];

/** Results of Discover (sources found on the web). */
export const DISCOVER_RESULTS = [
  { title: 'Projectile Motion Explained', kind: 'doc' as SourceKind, meta: 'physicsclassroom.com · 8 min read' },
  { title: 'Work, Energy and Power', kind: 'slides' as SourceKind, meta: 'openstax.org · 24 slides' },
  { title: 'Circular Motion Lab Manual', kind: 'pdf' as SourceKind, meta: 'university lab · 16 pages' },
  { title: 'Air Resistance and Terminal Velocity', kind: 'doc' as SourceKind, meta: 'nasa.gov · 5 min read' },
];

export const initialConnectors: Connector[] = [
  { id: 'outlook', name: 'Outlook', description: 'Mail and calendar', linked: true },
  { id: 'teams', name: 'Microsoft Teams', description: 'Chats and meeting notes', linked: true },
  { id: 'drive', name: 'Google Drive', description: 'Docs, sheets and slides', linked: false },
  { id: 'slack', name: 'Slack', description: 'Channels and threads', linked: false },
];

/** "Easy entry points": one click starts a task. */
export const ENTRY_POINTS = ['Today’s To-dos', 'New Process', 'Create Report', 'Crunch data', 'Create a file', 'New Opportunity'];

/** "Suggested questions": they tackle the blank page. */
export const SUGGESTED_QUESTIONS = ['How do Newton’s three laws of motion explain how objects move?', 'What are the different types of forces?'];

export const AGENTS = [
  { name: 'Agent Alpha', model: 'Reasoning model' },
  { name: 'Agent Bravo', model: 'Fast model' },
  { name: 'Agent Charlie', model: 'Long-context model' },
];

/** Damia's answer to a prompt, grounded on the selected sources. Paragraphs are separated by blank lines; "- " lines
 *  are bullets. Each answer cites the sources it drew on and offers what to make next in Studio. */
export function answerFor(prompt: string, sources: Source[]): Pick<Message, 'text' | 'sourceId' | 'sourceIds' | 'followUps'> {
  const p = prompt.toLowerCase();
  // Cite the named sources that are selected, or the first two selected ones when none of them is.
  const cite = (ids: string[]) => {
    const found = ids.filter((id) => sources.some((s) => s.id === id));
    const list = found.length ? found : sources.slice(0, 2).map((s) => s.id);
    return { sourceId: list[0], sourceIds: list };
  };
  if (sources.length === 0) {
    return { text: 'I don’t have any sources selected yet. Add a document or tick a source on the left, and I’ll answer from it.' };
  }
  if (p.includes('newton') || p.includes('law')) {
    return {
      ...cite(['s9', 's7', 's1']),
      text: 'Newton’s three laws describe how forces change motion:\n\n- First law (inertia): an object keeps its speed and direction unless a net force acts on it. That is why passengers lurch forward when a bus brakes.\n- Second law: the net force equals mass times acceleration (F = ma), so the same push moves a light trolley faster than a heavy one.\n- Third law: forces come in pairs. A rocket pushes gas down, and the gas pushes the rocket up.\n\nTogether they explain why things start, stop and turn. I can turn this into something you can teach from.',
      followUps: [
        { label: 'Turn this into a slide deck', kind: 'slides' },
        { label: 'Map it as a lesson plan', kind: 'process' },
      ],
    };
  }
  if (p.includes('force')) {
    return {
      ...cite(['s4', 's5', 's6']),
      text: 'Your sources group forces into two families:\n\n- Contact forces: friction, tension, normal force and air resistance. They need objects to touch.\n- Non-contact forces: gravity, magnetism and electrostatic force. They act at a distance.\n\nFriction Frenzy goes deeper on static versus kinetic friction, and Gravity’s Grip explains why weight is a force while mass is not.',
      followUps: [
        { label: 'Create an overview', kind: 'overview' },
        { label: 'Build a slide deck', kind: 'slides' },
      ],
    };
  }
  if (p.includes('to-do') || p.includes('todo')) {
    return {
      text: 'Here is what is open today:\n\n- Review the Momentum Mania lab activity before Thursday.\n- Finish the slide deck on gravity for period 3.\n- Reply to two parents about the physics test date.\n- Send the lab upgrade proposal to the Head of Science.\n\nI can start on the deck or the proposal now.',
      followUps: [
        { label: 'Build the gravity deck', kind: 'slides' },
        { label: 'Draft the proposal', kind: 'proposal' },
      ],
    };
  }
  if (p.includes('process')) {
    return {
      ...cite(['s9', 's8', 's7']),
      text: 'Here is a first pass at the process, one step per law:\n\n- Hook: a bus brakes and passengers lurch forward.\n- First law: the coin-and-card demo, then name inertia.\n- Second law: the trolley lab, plotting force against acceleration.\n- Third law: balloon rockets along a string.\n- Check: five short questions, then an exit quiz.\n\nI can lay this out as a process map with an owner for each step.',
      followUps: [{ label: 'Open as a process map', kind: 'process' }],
    };
  }
  if (p.includes('proposal') || p.includes('opportunity')) {
    return {
      ...cite(['s8', 's3']),
      text: 'There is a clear case in your sources: Momentum Mania and Newton’s Three Laws both depend on the trolley lab, and with two working kits most groups watch instead of measure.\n\n- Replace the trolley kits and add motion sensors.\n- Run the second-law lab with the whole class in one lesson.\n- Train the teachers in half a day.\n\nI can write this up as a proposal with a budget.',
      followUps: [{ label: 'Draft the proposal in Studio', kind: 'proposal' }],
    };
  }
  if (p.includes('slide') || p.includes('deck') || p.includes('file')) {
    return {
      ...cite(['s9', 's6', 's2']),
      text: 'A six-slide deck would cover it:\n\n- What is a force?\n- Balanced and unbalanced forces\n- Newton’s three laws\n- Friction and gravity\n- Quiz\n\nShall I build it from your selected sources?',
      followUps: [{ label: 'Build the slide deck', kind: 'slides' }],
    };
  }
  if (p.includes('report') || p.includes('crunch') || p.includes('data')) {
    return {
      ...cite(sources.slice(0, 3).map((s) => s.id)),
      text: `I read ${sources.length} selected sources. The most covered topics are forces (${Math.min(sources.length, 6)} sources), Newton’s laws (3) and momentum (2).\n\n- Strongest coverage: contact forces, the three laws, friction.\n- Thin coverage: energy and waves (only the textbook).\n- Ready to teach: every law has at least one experiment.\n\nI can turn this into an overview or a process map in Studio.`,
      followUps: [
        { label: 'Create an overview', kind: 'overview' },
        { label: 'Make a process map', kind: 'process' },
      ],
    };
  }
  return {
    ...cite([]),
    text: `Let’s start. I’ll work from your ${sources.length} selected source${sources.length === 1 ? '' : 's'}.\n\nTell me the goal in one line, and I’ll suggest the steps, the people to involve and what to create in Studio.`,
    followUps: [{ label: 'Create an overview', kind: 'overview' }],
  };
}

const today = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

/** The HTML form of an artifact, for the note editor and for converting it into a source. */
function html(a: Artifact): string {
  const li = (items: string[]) => items.map((x) => `<li>${x}</li>`).join('');
  switch (a.kind) {
    case 'overview':
      return `<h2>Overview</h2><p>${a.summary}</p><h3>Key topics</h3><p>${a.topics.join(', ')}.</p><h3>From your sources</h3><ul>${li(a.highlights.map((h) => `${h.title}: ${h.point}`))}</ul><h3>Next steps</h3><ol>${li(a.nextSteps)}</ol>`;
    case 'process':
      return `<h2>Process map</h2><p>${a.goal}</p><ol>${li(a.steps.map((s) => `${s.title} (${s.owner}): ${s.description}`))}</ol>`;
    case 'slides':
      return `<h2>Slide deck</h2>${a.slides.map((s, i) => `<h3>${i + 1}. ${s.title}</h3><ul>${li(s.bullets)}</ul>`).join('')}`;
    case 'proposal':
      return `<h2>Proposal</h2><p>Prepared for the ${a.preparedFor}.</p>${a.sections.map((s) => `<h3>${s.title}</h3><p>${s.text}</p>`).join('')}<h3>Budget</h3><ul>${li(a.costs.map((c) => `${c.item} × ${c.qty}: ${c.cost}`))}</ul><p>Total: ${a.total}.</p>`;
  }
}

export function noteFor(kind: Creation, sources: Source[]): Omit<Note, 'id'> {
  const basedOn = sources.length;
  switch (kind) {
    case 'overview': {
      const artifact: Artifact = {
        kind,
        summary: `Your ${basedOn} sources cover forces and motion from first principles to classroom labs: what a force is, how balanced and unbalanced forces change motion, Newton’s three laws, and the everyday cases (friction, gravity, inertia, momentum) that make them concrete.`,
        topics: [...new Set(sources.flatMap((s) => s.topics))].slice(0, 8),
        highlights: sources.slice(0, 5).map((s) => ({ sourceId: s.id, title: s.title, point: s.summary })),
        nextSteps: [
          'Open the unit with the bus-braking hook from Inertia In Action.',
          'Run the trolley lab from Momentum Mania in week two.',
          'Close with the three-law quiz from Newton’s Three Laws of Motion.',
        ],
      };
      return { kind, title: `Overview · forces and motion`, basedOn, artifact, body: html(artifact) };
    }
    case 'process': {
      const artifact: Artifact = {
        kind,
        goal: 'Teach Newton’s three laws in one week, each law anchored to an experiment.',
        steps: [
          { title: 'Hook: a bus brakes', description: 'Ask why passengers lurch forward and collect the answers on the board.', owner: 'Teacher' },
          { title: 'First law demo', description: 'Coin on a card over a glass: flick the card and the coin drops. Name inertia.', owner: 'Teacher' },
          { title: 'Second law lab', description: 'Trolleys on a track with one, two and three masses; plot force against acceleration.', owner: 'Groups of three' },
          { title: 'Third law rockets', description: 'Balloon rockets along a string; identify the force pair.', owner: 'Groups of three' },
          { title: 'Check understanding', description: 'Five short questions, one per concept, answered individually.', owner: 'Students' },
          { title: 'Exit quiz and re-teach', description: 'Mark the quiz, group the misconceptions, plan the re-teach.', owner: 'Teacher' },
        ],
      };
      return { kind, title: 'Process map · teaching Newton’s laws', basedOn, artifact, body: html(artifact) };
    }
    case 'slides': {
      const artifact: Artifact = {
        kind,
        slides: [
          { title: 'Forces and motion', bullets: ['Physics, week 3', `Built from ${basedOn} sources`] },
          { title: 'What is a force?', bullets: ['A push or a pull', 'Measured in newtons (N)', 'Contact and non-contact'] },
          { title: 'Balanced and unbalanced', bullets: ['Balanced: motion unchanged', 'Unbalanced: speed or direction changes', 'Free-body diagrams'] },
          { title: 'Newton’s three laws', bullets: ['First: inertia', 'Second: F = ma', 'Third: action and reaction'] },
          { title: 'Friction and gravity', bullets: ['Static vs kinetic friction', 'Weight is a force, mass is not', 'Why ice and rubber differ'] },
          { title: 'Quiz', bullets: ['Five questions', 'One per concept', 'Answers at the end'] },
        ],
      };
      return { kind, title: 'Slide deck · forces and motion', basedOn, artifact, body: html(artifact) };
    }
    case 'proposal': {
      const artifact: Artifact = {
        kind,
        preparedFor: 'Head of Science',
        sections: [
          { title: 'Summary', text: 'Replace the worn trolley kits and add motion sensors, so every group can run the second-law lab in one lesson instead of one group per week.' },
          { title: 'Why now', text: 'Momentum Mania and Newton’s Three Laws both depend on the trolley lab. With two working kits, four of six groups watch rather than measure.' },
          { title: 'What we propose', text: 'Six trolley kits with low-friction tracks and six motion sensors, shared between the physics classes, with a half-day of teacher training.' },
          { title: 'Timeline', text: 'Order in week 1, deliver by week 4, train in week 5, first full-class lab in week 6.' },
        ],
        costs: [
          { item: 'Trolley kit with track', qty: '6', cost: '₹ 48,000' },
          { item: 'Motion sensor', qty: '6', cost: '₹ 27,000' },
          { item: 'Teacher training (half day)', qty: '1', cost: '₹ 8,000' },
        ],
        total: '₹ 83,000',
      };
      return { kind, title: 'Proposal · physics lab upgrade', basedOn, artifact, body: html(artifact) };
    }
  }
}

/** What Damia says in the conversation once an output is ready. */
export function readyMessage(note: Note): string {
  const a = note.artifact;
  if (!a) return `${note.title} is ready in Studio.`;
  switch (a.kind) {
    case 'overview':
      return `Your overview is ready. It summarises ${note.basedOn} sources, pulls out ${a.topics.length} key topics and suggests three next steps.`;
    case 'process':
      return `Your process map is ready: ${a.steps.length} steps from the first hook to the exit quiz, each with an owner.`;
    case 'slides':
      return `Your slide deck is ready: ${a.slides.length} slides, from “What is a force?” to the quiz.`;
    case 'proposal':
      return `Your proposal is ready: ${a.sections.length} sections and a budget of ${a.total}, prepared for the ${a.preparedFor}.`;
  }
}

export const initialNotes: Note[] = [];

export const excerpt = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export { today };

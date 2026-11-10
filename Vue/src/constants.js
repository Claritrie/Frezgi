// Shared values for the argument map. Texts shown to users are kept here so
// that the wording stays the same across the dialog, the Key and the guide.

export const RESOLUTION_ID = 'resolution';

// Text of the main node before the user writes their resolution
export const DEFAULT_RESOLUTION_TEXT = 'Main Resolution';

export const RESOLUTION_HELP =
  'Write one clear statement that people could agree or disagree with. ' +
  'For example: "Phones should be banned in classrooms."';

// Fixed node dimensions, in pixels
export const NODE_WIDTH = 150;
export const NODE_BASE_HEIGHT = 40;
export const NODE_MENU_HEIGHT = 80;

// Screens narrower than this are treated as phones
export const NARROW_SCREEN_WIDTH = 600;

export const STORAGE_KEYS = {
  colorScheme: 'color-scheme',
  guideSeen: 'guide-seen',
  keyCollapsed: 'legend-collapsed',
  tutorialDone: 'tutorial-done',
};

// Default palette: every text colour has a contrast of at least 4.5:1 on its
// box, and every box has at least 3:1 on the canvas.
export const DEFAULT_COLORS = {
  canvas: '#1E2430',
  nodeColors: {
    resolution: '#F4F1EA',
    pro: '#33845B',
    con: '#BF4E47',
    exp: '#E3B93E',
  },
  textColors: {
    resolution: '#1F2937',
    pro: '#FFFFFF',
    con: '#FFFFFF',
    exp: '#1F2937',
  },
};

// Every kind of box on the map, in display order
export const NODE_TYPES = {
  resolution: {
    name: 'Resolution',
    panelLabel: 'Main',
    keyMeaning: 'the statement you are examining',
  },
  pro: {
    name: 'Supporting',
    panelLabel: 'Supporting',
    emoji: '👍',
    actionLabel: 'Add a supporting reason',
    keyMeaning: 'a reason for the point it is linked to',
    guidance: 'Give one reason why this point is true. Keep it to a single claim, so that it can be judged on its own.',
    placeholder: 'Type your reason here...',
  },
  con: {
    name: 'Opposing',
    panelLabel: 'Opposing',
    emoji: '👎',
    actionLabel: 'Add an opposing reason',
    keyMeaning: 'a reason against the point it is linked to',
    guidance: 'Give one reason why this point may be false. Try to write the strongest objection, even if you disagree with it.',
    placeholder: 'Type your objection here...',
  },
  exp: {
    name: 'Exploring',
    panelLabel: 'Exploring',
    emoji: '✋',
    actionLabel: 'Add a point to explore',
    keyMeaning: 'a question or something to check',
    guidance: 'Write a question or something to check, such as missing evidence or a word that needs a clear meaning.',
    placeholder: 'Type your question here...',
  },
};

// The types of point that can be added to any box
export const POINT_TYPES = ['pro', 'con', 'exp'];

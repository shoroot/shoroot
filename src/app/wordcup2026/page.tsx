"use client";

import { useEffect, useMemo, useState } from "react";

type GroupLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

type RoundName = "R32" | "R16" | "QF" | "SF" | "Final";

type Team = {
  name: string;
  group: GroupLetter;
  strength: number;
};

type GroupMatch = {
  home: Team;
  away: Team;
  homeGoals: number;
  awayGoals: number;
};

type Standing = {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

type ThirdPlaced = {
  team: Team;
  points: number;
  gd: number;
  gf: number;
};

type Match = {
  id: string;
  teamA: Team;
  teamB: Team;
  winner?: Team;
  score?: string;
  upset?: boolean;
};

type Bracket = {
  R32: Match[];
  R16: Match[];
  QF: Match[];
  SF: Match[];
  Final: Match[];
};

type GroupStageMode = "auto" | "manual" | "manual-ranking" | null;
type KnockoutMode = "manual" | null;

type GroupRankings = Record<GroupLetter, Team[]>;

type TournamentStatus = "draft" | "in_progress" | "completed";

type SavedTournamentSummary = {
  id: number;
  title: string;
  tournamentType: string;
  status: TournamentStatus;
  createdAt: string;
  updatedAt: string;
};

type TournamentSnapshot = {
  groupStageMode: GroupStageMode;
  manualGroupRankings: GroupRankings;
  selectedBestThirdGroups: GroupLetter[];
  groupDone: boolean;
  standingsByGroup: Record<GroupLetter, Standing[]> | null;
  qualifiedThirds: ThirdPlaced[];
  bracket: Bracket | null;
  knockoutMode: KnockoutMode;
  activeRound: RoundName;
  activeMatchIndex: number;
  goalLeaders: Record<string, number>;
  upsets: number;
  roundPausePrompt: boolean;
  tournamentTitle: string;
};

const FIXED_TOURNAMENT_TITLE = "World Cup 2026";
const FIXED_TOURNAMENT_TYPE = "world-cup-2026";

const GROUP_ORDER: GroupLetter[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

const ROUND_ORDER: RoundName[] = ["R32", "R16", "QF", "SF", "Final"];

const TEAM_STRENGTH: Record<string, number> = {
  Mexico: 80,
  "South Korea": 74,
  "Czech Republic": 73,
  "South Africa": 66,
  Canada: 76,
  Switzerland: 79,
  Qatar: 67,
  "Bosnia and Herzegovina": 71,
  Brazil: 93,
  Scotland: 72,
  Morocco: 82,
  Haiti: 58,
  USA: 82,
  Turkey: 76,
  Australia: 74,
  Paraguay: 75,
  Germany: 88,
  Ecuador: 78,
  "Ivory Coast": 77,
  Curaçao: 60,
  Netherlands: 87,
  Sweden: 78,
  Japan: 79,
  Tunisia: 71,
  Belgium: 86,
  Iran: 75,
  Egypt: 76,
  "New Zealand": 63,
  Spain: 90,
  Uruguay: 84,
  "Saudi Arabia": 69,
  "Cape Verde": 68,
  France: 91,
  Norway: 77,
  Senegal: 80,
  Iraq: 62,
  Argentina: 92,
  Austria: 77,
  Algeria: 74,
  Jordan: 64,
  Portugal: 89,
  Colombia: 83,
  Uzbekistan: 70,
  "Republic of Congo": 62,
  England: 89,
  Croatia: 84,
  Ghana: 76,
  Panama: 69,
};

const GROUPS: Record<GroupLetter, Team[]> = {
  A: [
    { name: "Mexico", group: "A", strength: TEAM_STRENGTH["Mexico"] },
    { name: "South Korea", group: "A", strength: TEAM_STRENGTH["South Korea"] },
    {
      name: "Czech Republic",
      group: "A",
      strength: TEAM_STRENGTH["Czech Republic"],
    },
    {
      name: "South Africa",
      group: "A",
      strength: TEAM_STRENGTH["South Africa"],
    },
  ],
  B: [
    { name: "Canada", group: "B", strength: TEAM_STRENGTH["Canada"] },
    {
      name: "Switzerland",
      group: "B",
      strength: TEAM_STRENGTH["Switzerland"],
    },
    { name: "Qatar", group: "B", strength: TEAM_STRENGTH["Qatar"] },
    {
      name: "Bosnia and Herzegovina",
      group: "B",
      strength: TEAM_STRENGTH["Bosnia and Herzegovina"],
    },
  ],
  C: [
    { name: "Brazil", group: "C", strength: TEAM_STRENGTH["Brazil"] },
    { name: "Scotland", group: "C", strength: TEAM_STRENGTH["Scotland"] },
    { name: "Morocco", group: "C", strength: TEAM_STRENGTH["Morocco"] },
    { name: "Haiti", group: "C", strength: TEAM_STRENGTH["Haiti"] },
  ],
  D: [
    { name: "USA", group: "D", strength: TEAM_STRENGTH["USA"] },
    { name: "Turkey", group: "D", strength: TEAM_STRENGTH["Turkey"] },
    { name: "Australia", group: "D", strength: TEAM_STRENGTH["Australia"] },
    { name: "Paraguay", group: "D", strength: TEAM_STRENGTH["Paraguay"] },
  ],
  E: [
    { name: "Germany", group: "E", strength: TEAM_STRENGTH["Germany"] },
    { name: "Ecuador", group: "E", strength: TEAM_STRENGTH["Ecuador"] },
    { name: "Ivory Coast", group: "E", strength: TEAM_STRENGTH["Ivory Coast"] },
    { name: "Curaçao", group: "E", strength: TEAM_STRENGTH["Curaçao"] },
  ],
  F: [
    {
      name: "Netherlands",
      group: "F",
      strength: TEAM_STRENGTH["Netherlands"],
    },
    { name: "Sweden", group: "F", strength: TEAM_STRENGTH["Sweden"] },
    { name: "Japan", group: "F", strength: TEAM_STRENGTH["Japan"] },
    { name: "Tunisia", group: "F", strength: TEAM_STRENGTH["Tunisia"] },
  ],
  G: [
    { name: "Belgium", group: "G", strength: TEAM_STRENGTH["Belgium"] },
    { name: "Iran", group: "G", strength: TEAM_STRENGTH["Iran"] },
    { name: "Egypt", group: "G", strength: TEAM_STRENGTH["Egypt"] },
    { name: "New Zealand", group: "G", strength: TEAM_STRENGTH["New Zealand"] },
  ],
  H: [
    { name: "Spain", group: "H", strength: TEAM_STRENGTH["Spain"] },
    { name: "Uruguay", group: "H", strength: TEAM_STRENGTH["Uruguay"] },
    {
      name: "Saudi Arabia",
      group: "H",
      strength: TEAM_STRENGTH["Saudi Arabia"],
    },
    { name: "Cape Verde", group: "H", strength: TEAM_STRENGTH["Cape Verde"] },
  ],
  I: [
    { name: "France", group: "I", strength: TEAM_STRENGTH["France"] },
    { name: "Norway", group: "I", strength: TEAM_STRENGTH["Norway"] },
    { name: "Senegal", group: "I", strength: TEAM_STRENGTH["Senegal"] },
    { name: "Iraq", group: "I", strength: TEAM_STRENGTH["Iraq"] },
  ],
  J: [
    { name: "Argentina", group: "J", strength: TEAM_STRENGTH["Argentina"] },
    { name: "Austria", group: "J", strength: TEAM_STRENGTH["Austria"] },
    { name: "Algeria", group: "J", strength: TEAM_STRENGTH["Algeria"] },
    { name: "Jordan", group: "J", strength: TEAM_STRENGTH["Jordan"] },
  ],
  K: [
    { name: "Portugal", group: "K", strength: TEAM_STRENGTH["Portugal"] },
    { name: "Colombia", group: "K", strength: TEAM_STRENGTH["Colombia"] },
    { name: "Uzbekistan", group: "K", strength: TEAM_STRENGTH["Uzbekistan"] },
    {
      name: "Republic of Congo",
      group: "K",
      strength: TEAM_STRENGTH["Republic of Congo"],
    },
  ],
  L: [
    { name: "England", group: "L", strength: TEAM_STRENGTH["England"] },
    { name: "Croatia", group: "L", strength: TEAM_STRENGTH["Croatia"] },
    { name: "Ghana", group: "L", strength: TEAM_STRENGTH["Ghana"] },
    { name: "Panama", group: "L", strength: TEAM_STRENGTH["Panama"] },
  ],
};

const GROUP_FIXTURES: Array<[number, number]> = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function simulateGroupGoals(teamA: Team, teamB: Team): [number, number] {
  const diff = teamA.strength - teamB.strength;
  const drawChance = Math.max(0.18, Math.min(0.34, 0.28 - Math.abs(diff) / 220));
  const pA = 1 / (1 + Math.pow(10, -(diff / 18)));
  const pB = 1 - pA;
  const roll = Math.random();

  if (roll < drawChance) {
    const drawGoals = randomChoice([0, 1, 1, 2]);
    return [drawGoals, drawGoals];
  }

  const homeWins = roll < drawChance + pA * (1 - drawChance) / (pA + pB);
  const winnerBase = Math.max(1, Math.min(4, Math.round((Math.max(teamA.strength, teamB.strength) - 58) / 15)));
  const loserBase = Math.max(0, Math.min(2, Math.round((Math.min(teamA.strength, teamB.strength) - 62) / 25)));

  if (homeWins) {
    const hg = Math.max(1, winnerBase + randomInt(0, 2));
    const ag = Math.max(0, loserBase + randomInt(0, 1));
    return hg <= ag ? [ag + 1, ag] : [hg, ag];
  }

  const ag = Math.max(1, winnerBase + randomInt(0, 2));
  const hg = Math.max(0, loserBase + randomInt(0, 1));
  return ag <= hg ? [hg, hg + 1] : [hg, ag];
}

function scorelineForForcedWinner(teamA: Team, teamB: Team, winner: Team): [number, number] {
  const stronger = teamA.strength >= teamB.strength ? teamA : teamB;
  const base = stronger.name === winner.name ? randomChoice([1, 2, 2, 3]) : randomChoice([1, 1, 2]);
  const loser = randomChoice([0, 1, 1, 2]);

  if (winner.name === teamA.name) {
    return [Math.max(base, loser + 1), loser];
  }
  return [loser, Math.max(base, loser + 1)];
}

function sortStandings(a: Standing, b: Standing): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.gd !== a.gd) return b.gd - a.gd;
  if (b.gf !== a.gf) return b.gf - a.gf;
  return b.team.strength - a.team.strength;
}

function computeGroupStandings(groupTeams: Team[], results: GroupMatch[]): Standing[] {
  const table: Record<string, Standing> = {};
  for (const t of groupTeams) {
    table[t.name] = {
      team: t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    };
  }

  for (const r of results) {
    const home = table[r.home.name];
    const away = table[r.away.name];

    home.played += 1;
    away.played += 1;
    home.gf += r.homeGoals;
    home.ga += r.awayGoals;
    away.gf += r.awayGoals;
    away.ga += r.homeGoals;

    if (r.homeGoals > r.awayGoals) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (r.homeGoals < r.awayGoals) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const standings = Object.values(table);
  for (const s of standings) {
    s.gd = s.gf - s.ga;
  }
  return standings.sort(sortStandings);
}

function rankThirdPlaced(allStandings: Record<GroupLetter, Standing[]>): ThirdPlaced[] {
  const thirdPlaced: ThirdPlaced[] = GROUP_ORDER.map((group) => {
    const third = allStandings[group][2];
    return {
      team: third.team,
      points: third.points,
      gd: third.gd,
      gf: third.gf,
    };
  });

  thirdPlaced.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.team.strength - a.team.strength;
  });

  return thirdPlaced;
}

function buildR32(
  winners: Team[],
  runners: Team[],
  bestThirds: Team[]
): Match[] {
  const sortedRunners = [...runners].sort((a, b) => b.strength - a.strength);
  const groupIndex = (g: GroupLetter) => GROUP_ORDER.indexOf(g);
  const tier1 = [...winners, ...sortedRunners.slice(0, 4)].sort((a, b) => {
    const ga = groupIndex(a.group);
    const gb = groupIndex(b.group);
    if (ga !== gb) return ga - gb;
    return b.strength - a.strength;
  });
  const tier2 = [...sortedRunners.slice(4), ...bestThirds].sort((a, b) => {
    const ga = groupIndex(a.group);
    const gb = groupIndex(b.group);
    if (ga !== gb) return ga - gb;
    return b.strength - a.strength;
  });

  const tryBuild = (
    leftTier1: Team[],
    leftTier2: Team[],
    blocks: Match[]
  ): Match[] | null => {
    if (leftTier1.length === 0) return blocks;

    const anchor = leftTier1[0];
    const otherTier1Candidates = leftTier1.slice(1);

    for (const t1b of otherTier1Candidates) {
      if (t1b.group === anchor.group) continue;

      const t2Candidates = leftTier2.filter(
        (t2) => t2.group !== anchor.group && t2.group !== t1b.group
      );

      for (let i = 0; i < t2Candidates.length; i += 1) {
        const t2a = t2Candidates[i];
        for (let j = i + 1; j < t2Candidates.length; j += 1) {
          const t2b = t2Candidates[j];
          const groups = new Set([anchor.group, t1b.group, t2a.group, t2b.group]);
          if (groups.size !== 4) continue;

          const pairings: Array<[[Team, Team], [Team, Team]]> = [
            [[anchor, t2a], [t1b, t2b]],
            [[anchor, t2b], [t1b, t2a]],
          ];

          for (const pairing of pairings) {
            const [m1, m2] = pairing;
            const nextTier1 = leftTier1.filter(
              (t) => t.name !== anchor.name && t.name !== t1b.name
            );
            const nextTier2 = leftTier2.filter(
              (t) => t.name !== t2a.name && t.name !== t2b.name
            );

            const start = blocks.length + 1;
            const result = tryBuild(nextTier1, nextTier2, [
              ...blocks,
              { id: `R32-${start}`, teamA: m1[0], teamB: m1[1] },
              { id: `R32-${start + 1}`, teamA: m2[0], teamB: m2[1] },
            ]);

            if (result) return result;
          }
        }
      }
    }

    return null;
  };

  const built = tryBuild(tier1, tier2, []);
  if (built) return built;

  const hardFallbackBacktrack = (
    left: Team[],
    blocks: Match[]
  ): Match[] | null => {
    if (left.length === 0) return blocks;

    const anchor = left[0];
    const remaining = left.slice(1);

    for (let i = 0; i < remaining.length; i += 1) {
      for (let j = i + 1; j < remaining.length; j += 1) {
        for (let k = j + 1; k < remaining.length; k += 1) {
          const candidates = [anchor, remaining[i], remaining[j], remaining[k]];
          const groups = new Set(candidates.map((c) => c.group));
          if (groups.size !== 4) continue;

          const pairings: Array<[[Team, Team], [Team, Team]]> = [
            [[candidates[0], candidates[1]], [candidates[2], candidates[3]]],
            [[candidates[0], candidates[2]], [candidates[1], candidates[3]]],
            [[candidates[0], candidates[3]], [candidates[1], candidates[2]]],
          ];

          for (const pairing of pairings) {
            const [m1, m2] = pairing;
            const picked = new Set(candidates.map((c) => c.name));
            const nextLeft = left.filter((t) => !picked.has(t.name));
            const start = blocks.length + 1;
            const rec = hardFallbackBacktrack(nextLeft, [
              ...blocks,
              { id: `R32-${start}`, teamA: m1[0], teamB: m1[1] },
              { id: `R32-${start + 1}`, teamA: m2[0], teamB: m2[1] },
            ]);
            if (rec) return rec;
          }
        }
      }
    }

    return null;
  };

  const hardFallback = hardFallbackBacktrack([...tier1, ...tier2], []);
  if (hardFallback) return hardFallback;

  throw new Error("Unable to generate a valid R32 bracket with group constraints.");
}

function nextRoundName(round: RoundName): RoundName | null {
  if (round === "R32") return "R16";
  if (round === "R16") return "QF";
  if (round === "QF") return "SF";
  if (round === "SF") return "Final";
  return null;
}

function playerPool(teamName: string): string[] {
  const short = teamName.split(" ")[0];
  return [`${short} Star`, `${short} No.9`, `${short} Winger`];
}

function getTeamFlagCode(teamName: string): string {
  const flags: Record<string, string> = {
    Mexico: "mx",
    "South Korea": "kr",
    "Czech Republic": "cz",
    "South Africa": "za",
    Canada: "ca",
    Switzerland: "ch",
    Qatar: "qa",
    "Bosnia and Herzegovina": "ba",
    Brazil: "br",
    Scotland: "gb",
    Morocco: "ma",
    Haiti: "ht",
    USA: "us",
    Turkey: "tr",
    Australia: "au",
    Paraguay: "py",
    Germany: "de",
    Ecuador: "ec",
    "Ivory Coast": "ci",
    Curaçao: "cw",
    Netherlands: "nl",
    Sweden: "se",
    Japan: "jp",
    Tunisia: "tn",
    Belgium: "be",
    Iran: "ir",
    Egypt: "eg",
    "New Zealand": "nz",
    Spain: "es",
    Uruguay: "uy",
    "Saudi Arabia": "sa",
    "Cape Verde": "cv",
    France: "fr",
    Norway: "no",
    Senegal: "sn",
    Iraq: "iq",
    Argentina: "ar",
    Austria: "at",
    Algeria: "dz",
    Jordan: "jo",
    Portugal: "pt",
    Colombia: "co",
    Uzbekistan: "uz",
    "Republic of Congo": "cg",
    England: "gb",
    Croatia: "hr",
    Ghana: "gh",
    Panama: "pa",
  };

  return flags[teamName] ?? "un";
}

function TeamLabel({ teamName }: { teamName: string }) {
  const code = getTeamFlagCode(teamName);
  const src = `https://flagcdn.com/24x18/${code}.png`;
  const isIranCrab = teamName === "Iran";

  return (
    <span className="inline-flex items-center gap-2">
      {isIranCrab ? (
        <span
          role="img"
          aria-label="Iran crab"
          className="inline-flex h-4 w-6 items-center justify-center"
        >
          🦀
        </span>
      ) : (
        <img
          src={src}
          alt={`${teamName} flag`}
          className="h-4 w-6 rounded-[2px] border border-slate-500/60 object-cover"
          loading="lazy"
          decoding="async"
        />
      )}
      <span>{teamName}</span>
    </span>
  );
}

function rankColorClass(index: number): string {
  if (index === 0) return "border-emerald-400/60 bg-emerald-700/35 text-emerald-100";
  if (index === 1) return "border-emerald-300/50 bg-emerald-500/20 text-emerald-100";
  if (index === 2) return "border-amber-400/60 bg-amber-500/20 text-amber-100";
  return "border-rose-400/60 bg-rose-500/20 text-rose-100";
}

function buildInitialRankings(): GroupRankings {
  return {
    A: [...GROUPS.A],
    B: [...GROUPS.B],
    C: [...GROUPS.C],
    D: [...GROUPS.D],
    E: [...GROUPS.E],
    F: [...GROUPS.F],
    G: [...GROUPS.G],
    H: [...GROUPS.H],
    I: [...GROUPS.I],
    J: [...GROUPS.J],
    K: [...GROUPS.K],
    L: [...GROUPS.L],
  };
}

function standingsFromManualOrder(order: Team[]): Standing[] {
  return order.map((team) => ({
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
  }));
}

function WorldCupSimulatorPage() {
  const allTeams = useMemo(() => GROUP_ORDER.flatMap((g) => GROUPS[g]), []);

  const [groupStageMode, setGroupStageMode] = useState<GroupStageMode>("manual-ranking");
  const [groupResults, setGroupResults] = useState<Record<GroupLetter, GroupMatch[]>>({
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    F: [],
    G: [],
    H: [],
    I: [],
    J: [],
    K: [],
    L: [],
  });
  const [manualGroupCursor, setManualGroupCursor] = useState({ groupIndex: 0, matchIndex: 0 });
  const [manualGroupRankings, setManualGroupRankings] = useState<GroupRankings>(buildInitialRankings());
  const [selectedBestThirdGroups, setSelectedBestThirdGroups] = useState<GroupLetter[]>([]);
  const [draggingTeam, setDraggingTeam] = useState<{ group: GroupLetter; index: number } | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ group: GroupLetter; index: number } | null>(null);
  const [groupDone, setGroupDone] = useState(false);

  const [standingsByGroup, setStandingsByGroup] = useState<Record<GroupLetter, Standing[]> | null>(null);
  const [qualifiedThirds, setQualifiedThirds] = useState<ThirdPlaced[]>([]);

  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [knockoutMode, setKnockoutMode] = useState<KnockoutMode>("manual");
  const [activeRound, setActiveRound] = useState<RoundName>("R32");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const [goalLeaders, setGoalLeaders] = useState<Record<string, number>>({});
  const [upsets, setUpsets] = useState(0);
  const [roundPausePrompt, setRoundPausePrompt] = useState(false);
  const [tournamentTitle] = useState(FIXED_TOURNAMENT_TITLE);
  const [currentTournamentId, setCurrentTournamentId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSavingTournament, setIsSavingTournament] = useState(false);
  const [isAutoLoadingTournament, setIsAutoLoadingTournament] = useState(false);

  const champion = bracket?.Final[0]?.winner;
  const runnerUp = champion
    ? bracket?.Final[0].teamA.name === champion.name
      ? bracket?.Final[0].teamB
      : bracket?.Final[0].teamA
    : undefined;

  const topScorer = useMemo(() => {
    const entries = Object.entries(goalLeaders);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return { name: entries[0][0], goals: entries[0][1] };
  }, [goalLeaders]);

  const currentManualGroupFixture = useMemo(() => {
    if (groupStageMode !== "manual" || groupDone) return null;
    const group = GROUP_ORDER[manualGroupCursor.groupIndex];
    if (!group) return null;
    const fixture = GROUP_FIXTURES[manualGroupCursor.matchIndex];
    if (!fixture) return null;
    return {
      group,
      home: GROUPS[group][fixture[0]],
      away: GROUPS[group][fixture[1]],
    };
  }, [groupStageMode, groupDone, manualGroupCursor]);

  const manualThirdCandidates = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      team: manualGroupRankings[group][2],
    }));
  }, [manualGroupRankings]);

  function resetTournament() {
    setGroupStageMode("manual-ranking");
    setGroupResults({ A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [], J: [], K: [], L: [] });
    setManualGroupCursor({ groupIndex: 0, matchIndex: 0 });
    setManualGroupRankings(buildInitialRankings());
    setSelectedBestThirdGroups([]);
    setDraggingTeam(null);
    setDragOverTarget(null);
    setGroupDone(false);
    setStandingsByGroup(null);
    setQualifiedThirds([]);
    setBracket(null);
    setKnockoutMode("manual");
    setActiveRound("R32");
    setActiveMatchIndex(0);
    setGoalLeaders({});
    setUpsets(0);
    setRoundPausePrompt(false);
    setSaveMessage(null);
  }

  function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  function getTournamentStatus(): TournamentStatus {
    if (champion) return "completed";
    if (groupDone || bracket) return "in_progress";
    return "draft";
  }

  function getTournamentDefinition() {
    return {
      key: "world-cup-2026",
      title: "FIFA World Cup 2026",
      groups: GROUP_ORDER.map((group) => ({
        group,
        teams: GROUPS[group].map((team) => ({
          name: team.name,
          strength: team.strength,
        })),
      })),
    };
  }

  function buildSnapshot(): TournamentSnapshot {
    return {
      groupStageMode,
      manualGroupRankings,
      selectedBestThirdGroups,
      groupDone,
      standingsByGroup,
      qualifiedThirds,
      bracket,
      knockoutMode,
      activeRound,
      activeMatchIndex,
      goalLeaders,
      upsets,
      roundPausePrompt,
      tournamentTitle: FIXED_TOURNAMENT_TITLE,
    };
  }

  function applySnapshot(snapshot: TournamentSnapshot, tournamentId?: number) {
    setGroupStageMode(snapshot.groupStageMode ?? "manual-ranking");
    setManualGroupRankings(snapshot.manualGroupRankings ?? buildInitialRankings());
    setSelectedBestThirdGroups(snapshot.selectedBestThirdGroups ?? []);
    setGroupDone(snapshot.groupDone ?? false);
    setStandingsByGroup(snapshot.standingsByGroup ?? null);
    setQualifiedThirds(snapshot.qualifiedThirds ?? []);
    setBracket(snapshot.bracket ?? null);
    setKnockoutMode(snapshot.knockoutMode ?? "manual");
    setActiveRound(snapshot.activeRound ?? "R32");
    setActiveMatchIndex(snapshot.activeMatchIndex ?? 0);
    setGoalLeaders(snapshot.goalLeaders ?? {});
    setUpsets(snapshot.upsets ?? 0);
    setRoundPausePrompt(snapshot.roundPausePrompt ?? false);
    setCurrentTournamentId(tournamentId ?? null);
  }

  async function loadCurrentTournament() {
    const token = getAuthToken();
    if (!token) {
      return;
    }

    setIsAutoLoadingTournament(true);
    try {
      const response = await fetch("/api/tournaments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load tournaments");
      }

      const tournaments = (data.tournaments ?? []) as SavedTournamentSummary[];
      const current = tournaments.find(
        (item) =>
          item.title === FIXED_TOURNAMENT_TITLE &&
          item.tournamentType === FIXED_TOURNAMENT_TYPE
      );

      if (current) {
        await loadTournamentById(current.id, false);
      }
    } catch (error) {
      console.error("Load tournaments failed:", error);
      setSaveMessage(error instanceof Error ? error.message : "Failed to load tournaments");
    } finally {
      setIsAutoLoadingTournament(false);
    }
  }

  async function saveTournament() {
    const token = getAuthToken();
    if (!token) {
      setSaveMessage("برای ذخیره تورنومنت باید وارد حساب کاربری شوی.");
      return;
    }

    setIsSavingTournament(true);
    setSaveMessage(null);

    try {
      const payload = {
        title: tournamentTitle.trim(),
        tournamentType: FIXED_TOURNAMENT_TYPE,
        status: getTournamentStatus(),
        definition: getTournamentDefinition(),
        state: buildSnapshot(),
      };

      const url = currentTournamentId
        ? `/api/tournaments/${currentTournamentId}`
        : "/api/tournaments";
      const method = currentTournamentId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save tournament");
      }

      setCurrentTournamentId(data.tournament.id);
      setSaveMessage("تورنومنت با موفقیت ذخیره شد.");
    } catch (error) {
      console.error("Save tournament failed:", error);
      setSaveMessage(error instanceof Error ? error.message : "Failed to save tournament");
    } finally {
      setIsSavingTournament(false);
    }
  }

  async function loadTournamentById(id: number, announce = true) {
    const token = getAuthToken();
    if (!token) {
      setSaveMessage("برای بارگذاری تورنومنت باید وارد حساب کاربری شوی.");
      return;
    }

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load tournament");
      }

      applySnapshot(data.tournament.state, data.tournament.id);
      if (announce) {
        setSaveMessage("تورنومنت قبلی بارگذاری شد.");
      }
    } catch (error) {
      console.error("Load tournament failed:", error);
      setSaveMessage(error instanceof Error ? error.message : "Failed to load tournament");
    }
  }

  useEffect(() => {
    loadCurrentTournament();
  }, []);

  function startManualRankingMode() {
    const freshRankings = buildInitialRankings();
    setGroupStageMode("manual-ranking");
    setManualGroupRankings(freshRankings);

    const defaultTop8Groups = GROUP_ORDER
      .map((group) => ({ group, team: freshRankings[group][2] }))
      .sort((a, b) => b.team.strength - a.team.strength)
      .slice(0, 8)
      .map((x) => x.group);
    setSelectedBestThirdGroups(defaultTop8Groups);
  }

  function moveTeamInGroup(group: GroupLetter, index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target > 3) return;

    setManualGroupRankings((prev) => {
      const copy = { ...prev };
      const teams = [...copy[group]];
      [teams[index], teams[target]] = [teams[target], teams[index]];
      copy[group] = teams;
      return copy;
    });
  }

  function reorderGroupTeams(group: GroupLetter, fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setManualGroupRankings((prev) => {
      const copy = { ...prev };
      const teams = [...copy[group]];
      const [moved] = teams.splice(fromIndex, 1);
      teams.splice(toIndex, 0, moved);
      copy[group] = teams;
      return copy;
    });
  }

  function onGroupDragStart(group: GroupLetter, index: number) {
    setDraggingTeam({ group, index });
    setDragOverTarget({ group, index });
  }

  function onGroupDragOver(e: React.DragEvent<HTMLDivElement>, group: GroupLetter, index: number) {
    e.preventDefault();
    if (!draggingTeam || draggingTeam.group !== group) return;
    if (dragOverTarget?.group === group && dragOverTarget.index === index) return;
    setDragOverTarget({ group, index });
  }

  function onGroupDrop(group: GroupLetter, index: number) {
    if (!draggingTeam || draggingTeam.group !== group) return;
    reorderGroupTeams(group, draggingTeam.index, index);
    setDraggingTeam(null);
    setDragOverTarget(null);
  }

  function onGroupDragEnd() {
    setDraggingTeam(null);
    setDragOverTarget(null);
  }

  function toggleBestThirdGroup(group: GroupLetter) {
    setSelectedBestThirdGroups((prev) => {
      if (prev.includes(group)) {
        return prev.filter((g) => g !== group);
      }
      if (prev.length >= 8) return prev;
      return [...prev, group];
    });
  }

  function autoPickBestThirdsByStrength() {
    const top8 = GROUP_ORDER
      .map((group) => ({ group, team: manualGroupRankings[group][2] }))
      .sort((a, b) => b.team.strength - a.team.strength)
      .slice(0, 8)
      .map((x) => x.group);
    setSelectedBestThirdGroups(top8);
  }

  function finalizeManualRankings() {
    if (selectedBestThirdGroups.length !== 8) return;

    const standings: Record<GroupLetter, Standing[]> = {
      A: standingsFromManualOrder(manualGroupRankings.A),
      B: standingsFromManualOrder(manualGroupRankings.B),
      C: standingsFromManualOrder(manualGroupRankings.C),
      D: standingsFromManualOrder(manualGroupRankings.D),
      E: standingsFromManualOrder(manualGroupRankings.E),
      F: standingsFromManualOrder(manualGroupRankings.F),
      G: standingsFromManualOrder(manualGroupRankings.G),
      H: standingsFromManualOrder(manualGroupRankings.H),
      I: standingsFromManualOrder(manualGroupRankings.I),
      J: standingsFromManualOrder(manualGroupRankings.J),
      K: standingsFromManualOrder(manualGroupRankings.K),
      L: standingsFromManualOrder(manualGroupRankings.L),
    };

    const winners = GROUP_ORDER.map((g) => manualGroupRankings[g][0]);
    const runners = GROUP_ORDER.map((g) => manualGroupRankings[g][1]);
    const bestThirds = selectedBestThirdGroups.map((g) => manualGroupRankings[g][2]);
    const rankedThirds = selectedBestThirdGroups.map((g) => ({
      team: manualGroupRankings[g][2],
      points: 0,
      gd: 0,
      gf: 0,
    }));

    const r32 = buildR32(winners, runners, bestThirds);

    setStandingsByGroup(standings);
    setQualifiedThirds(rankedThirds);
    setGroupDone(true);
    setBracket({ R32: r32, R16: [], QF: [], SF: [], Final: [] });
    setKnockoutMode("manual");
  }

  function finalizeGroupStage(results: Record<GroupLetter, GroupMatch[]>) {
    const standings: Record<GroupLetter, Standing[]> = {
      A: computeGroupStandings(GROUPS.A, results.A),
      B: computeGroupStandings(GROUPS.B, results.B),
      C: computeGroupStandings(GROUPS.C, results.C),
      D: computeGroupStandings(GROUPS.D, results.D),
      E: computeGroupStandings(GROUPS.E, results.E),
      F: computeGroupStandings(GROUPS.F, results.F),
      G: computeGroupStandings(GROUPS.G, results.G),
      H: computeGroupStandings(GROUPS.H, results.H),
      I: computeGroupStandings(GROUPS.I, results.I),
      J: computeGroupStandings(GROUPS.J, results.J),
      K: computeGroupStandings(GROUPS.K, results.K),
      L: computeGroupStandings(GROUPS.L, results.L),
    };

    const winners = GROUP_ORDER.map((g) => standings[g][0].team);
    const runners = GROUP_ORDER.map((g) => standings[g][1].team);
    const rankedThirds = rankThirdPlaced(standings);
    const bestThirds = rankedThirds.slice(0, 8).map((t) => t.team);

    const r32 = buildR32(winners, runners, bestThirds);

    setStandingsByGroup(standings);
    setQualifiedThirds(rankedThirds.slice(0, 8));
    setGroupDone(true);
    setBracket({ R32: r32, R16: [], QF: [], SF: [], Final: [] });
  }

  function runAutoGroupStage() {
    const autoResults: Record<GroupLetter, GroupMatch[]> = {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: [],
      G: [],
      H: [],
      I: [],
      J: [],
      K: [],
      L: [],
    };

    for (const group of GROUP_ORDER) {
      const teams = GROUPS[group];
      for (const [i1, i2] of GROUP_FIXTURES) {
        const home = teams[i1];
        const away = teams[i2];
        const [homeGoals, awayGoals] = simulateGroupGoals(home, away);
        autoResults[group].push({ home, away, homeGoals, awayGoals });
      }
    }

    setGroupResults(autoResults);
    setGroupStageMode("auto");
    finalizeGroupStage(autoResults);
  }

  function pickManualGroupResult(choice: "home" | "draw" | "away") {
    const fixture = currentManualGroupFixture;
    if (!fixture) return;

    const { group, home, away } = fixture;
    let goals: [number, number];

    if (choice === "draw") {
      const g = randomChoice([0, 1, 1, 2]);
      goals = [g, g];
    } else if (choice === "home") {
      goals = scorelineForForcedWinner(home, away, home);
    } else {
      goals = scorelineForForcedWinner(home, away, away);
    }

    const updated = {
      ...groupResults,
      [group]: [
        ...groupResults[group],
        { home, away, homeGoals: goals[0], awayGoals: goals[1] },
      ],
    };

    setGroupResults(updated);

    const atLastMatchOfGroup = manualGroupCursor.matchIndex === GROUP_FIXTURES.length - 1;
    const atLastGroup = manualGroupCursor.groupIndex === GROUP_ORDER.length - 1;

    if (atLastMatchOfGroup && atLastGroup) {
      finalizeGroupStage(updated);
      return;
    }

    if (atLastMatchOfGroup) {
      setManualGroupCursor({
        groupIndex: manualGroupCursor.groupIndex + 1,
        matchIndex: 0,
      });
      return;
    }

    setManualGroupCursor({
      groupIndex: manualGroupCursor.groupIndex,
      matchIndex: manualGroupCursor.matchIndex + 1,
    });
  }

  function recordScorers(team: Team, goals: number, map: Record<string, number>) {
    if (goals <= 0) return;
    const players = playerPool(team.name);
    for (let g = 0; g < goals; g += 1) {
      const scorer = randomChoice(players);
      map[scorer] = (map[scorer] ?? 0) + 1;
    }
  }

  function simulateKnockoutMatch(teamA: Team, teamB: Team, forcedWinner?: Team) {
    const pA = 1 / (1 + Math.pow(10, -((teamA.strength - teamB.strength) / 16)));
    const aWins = forcedWinner
      ? forcedWinner.name === teamA.name
      : Math.random() < pA;

    let aGoals = randomChoice([0, 1, 1, 2, 2, 3]);
    let bGoals = randomChoice([0, 0, 1, 1, 2]);

    if (forcedWinner) {
      const score = scorelineForForcedWinner(teamA, teamB, forcedWinner);
      aGoals = score[0];
      bGoals = score[1];
    } else if (aWins && aGoals <= bGoals) {
      aGoals = bGoals + 1;
    } else if (!aWins && bGoals <= aGoals) {
      bGoals = aGoals + 1;
    }

    const winner = aGoals > bGoals ? teamA : teamB;
    const upset = winner.strength + 6 < (winner.name === teamA.name ? teamB.strength : teamA.strength);

    return {
      winner,
      score: `${aGoals}-${bGoals}`,
      goalsA: aGoals,
      goalsB: bGoals,
      upset,
    };
  }

  function buildNextRoundMatches(round: RoundName, winners: Team[]): Match[] {
    const next = nextRoundName(round);
    if (!next) return [];

    const matches: Match[] = [];
    for (let i = 0; i < winners.length; i += 2) {
      matches.push({
        id: `${next}-${matches.length + 1}`,
        teamA: winners[i],
        teamB: winners[i + 1],
      });
    }
    return matches;
  }

  function completeRound(round: RoundName, updatedMatches: Match[]) {
    const winners = updatedMatches.map((m) => m.winner).filter(Boolean) as Team[];
    const next = nextRoundName(round);

    setBracket((prev) => {
      if (!prev) return prev;
      const nextBracket = { ...prev, [round]: updatedMatches };
      if (next) {
        nextBracket[next] = buildNextRoundMatches(round, winners);
      }
      return nextBracket;
    });

    if (next) {
      setActiveRound(next);
      setActiveMatchIndex(0);
    }
  }

  function applyMatchResult(round: RoundName, index: number, forcedWinner?: Team) {
    if (!bracket) return;
    const roundMatches = [...bracket[round]];
    const match = roundMatches[index];
    if (!match) return;

    const result = simulateKnockoutMatch(match.teamA, match.teamB, forcedWinner);
    roundMatches[index] = {
      ...match,
      winner: result.winner,
      score: result.score,
      upset: result.upset,
    };

    const scorerMap = { ...goalLeaders };
    recordScorers(match.teamA, result.goalsA, scorerMap);
    recordScorers(match.teamB, result.goalsB, scorerMap);
    setGoalLeaders(scorerMap);
    if (result.upset) setUpsets((u) => u + 1);

    const isRoundDone = roundMatches.every((m) => m.winner);

    if (isRoundDone) {
      completeRound(round, roundMatches);
      return;
    }

    setBracket((prev) => (prev ? { ...prev, [round]: roundMatches } : prev));
    setActiveMatchIndex(index + 1);
  }

  function runRoundAuto(round: RoundName) {
    if (!bracket) return;
    const matches = bracket[round];
    if (!matches || matches.length === 0) return;

    let scorerMap = { ...goalLeaders };
    let upsetCount = 0;
    const updated = matches.map((m) => {
      if (m.winner) return m;
      const result = simulateKnockoutMatch(m.teamA, m.teamB);
      recordScorers(m.teamA, result.goalsA, scorerMap);
      recordScorers(m.teamB, result.goalsB, scorerMap);
      if (result.upset) upsetCount += 1;

      return {
        ...m,
        winner: result.winner,
        score: result.score,
        upset: result.upset,
      };
    });

    setGoalLeaders(scorerMap);
    setUpsets((u) => u + upsetCount);
    completeRound(round, updated);
  }

  function runAutoWithPauseStart() {
    if (!bracket) return;
    setKnockoutMode("auto");
    runRoundAuto(activeRound);
    setRoundPausePrompt(true);
  }

  function runNextAutoRound() {
    if (!bracket) return;
    if (activeRound === "Final" && bracket.Final[0]?.winner) {
      setRoundPausePrompt(false);
      return;
    }
    runRoundAuto(activeRound);
    setRoundPausePrompt(true);
  }

  function runFullAuto() {
    if (!bracket) return;

    let localBracket: Bracket = { ...bracket };
    let localScorers = { ...goalLeaders };
    let upsetCount = 0;

    const resolveRound = (round: RoundName) => {
      const matches = localBracket[round];
      const updated = matches.map((m) => {
        if (m.winner) return m;
        const result = simulateKnockoutMatch(m.teamA, m.teamB);
        recordScorers(m.teamA, result.goalsA, localScorers);
        recordScorers(m.teamB, result.goalsB, localScorers);
        if (result.upset) upsetCount += 1;

        return {
          ...m,
          winner: result.winner,
          score: result.score,
          upset: result.upset,
        };
      });

      localBracket = { ...localBracket, [round]: updated };
      const winners = updated.map((m) => m.winner).filter(Boolean) as Team[];
      const next = nextRoundName(round);
      if (next) {
        localBracket = {
          ...localBracket,
          [next]: buildNextRoundMatches(round, winners),
        };
      }
    };

    resolveRound("R32");
    resolveRound("R16");
    resolveRound("QF");
    resolveRound("SF");
    resolveRound("Final");

    setBracket(localBracket);
    setGoalLeaders(localScorers);
    setUpsets((u) => u + upsetCount);
    setKnockoutMode("full-auto");
    setActiveRound("Final");
    setActiveMatchIndex(0);
    setRoundPausePrompt(false);
  }

  const activeManualMatch = bracket
    ? bracket[activeRound]?.[activeMatchIndex]
    : undefined;

  const leftR32 = bracket?.R32.slice(0, 8) ?? [];
  const rightR32 = bracket?.R32.slice(8) ?? [];
  const leftR16 = bracket?.R16.slice(0, 4) ?? [];
  const rightR16 = bracket?.R16.slice(4) ?? [];
  const leftQF = bracket?.QF.slice(0, 2) ?? [];
  const rightQF = bracket?.QF.slice(2) ?? [];
  const leftSF = bracket?.SF[0];
  const rightSF = bracket?.SF[1];

  const isActiveCard = (m: Match | undefined): boolean => {
    if (!m || !activeManualMatch) return false;
    return m.id === activeManualMatch.id;
  };

  const renderMatchCard = (m: Match | undefined, key: string) => {
    if (!m) {
      return (
        <div key={key} className="wc-m empty">
          <div className="wc-mt empty">-</div>
          <div className="wc-mt empty">-</div>
        </div>
      );
    }

    const active = isActiveCard(m);

    return (
      <div key={key} className={`wc-m ${active ? "is-active" : ""}`}>
        <button
          type="button"
          onClick={() => active && applyMatchResult(activeRound, activeMatchIndex, m.teamA)}
          className={`wc-mt ${active ? "pickable" : ""} ${m.winner?.name === m.teamA.name ? "winner" : ""}`}
        >
          <TeamLabel teamName={m.teamA.name} />
        </button>
        <button
          type="button"
          onClick={() => active && applyMatchResult(activeRound, activeMatchIndex, m.teamB)}
          className={`wc-mt ${active ? "pickable" : ""} ${m.winner?.name === m.teamB.name ? "winner" : ""}`}
        >
          <TeamLabel teamName={m.teamB.name} />
        </button>
      </div>
    );
  };

  const renderRoundColumn = (
    title: string,
    side: "left" | "right",
    size: "r32" | "r16" | "qf" | "sf",
    matches: Match[]
  ) => (
    <div className={`wc-rd ${size}`} data-side={side}>
      <div className="wc-rl">{title}</div>
      {matches.map((m) => renderMatchCard(m, m.id))}
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 text-slate-100 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-5 shadow-xl shadow-emerald-900/20 backdrop-blur sm:p-7">
          <h1 className="text-balance text-2xl font-black tracking-tight text-emerald-300 sm:text-4xl">
            FIFA World Cup 2026 Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            48 teams, 12 groups, best 8 third-placed qualifiers, and a live knockout bracket.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={resetTournament}
              className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700"
            >
              Reset Tournament
            </button>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Tournament</p>
                <h2 className="text-lg font-bold text-slate-100">{FIXED_TOURNAMENT_TITLE}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  با ورود به این صفحه، اگر ذخیره قبلی داشته باشی به صورت خودکار لود می‌شود.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={saveTournament}
                  disabled={isSavingTournament}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
                >
                  {currentTournamentId ? "Update World Cup 2026" : "Save World Cup 2026"}
                </button>
              </div>
            </div>

            {(saveMessage || isAutoLoadingTournament) && (
              <p className="mt-3 text-sm text-amber-200">
                {isAutoLoadingTournament ? "در حال بررسی ذخیره قبلی کاربر..." : saveMessage}
              </p>
            )}
          </div>
        </header>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-emerald-300 sm:text-xl">Groups</h2>
          <p className="mt-1 text-sm text-slate-300">
            رتبه بندي گروه ها را خودت مشخص کن و سپس مستقيم وارد براکت حذفي شو.
          </p>

          {groupStageMode === "manual-ranking" && !groupDone && (
            <div className="mt-4 space-y-4 rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">
              <p className="text-sm font-semibold text-cyan-100">
                رتبه بندی هر گروه را خودت با دکمه هاي بالا/پايين تعيين کن. امتياز محاسبه نمي شود.
              </p>
              <p className="text-xs text-slate-300">
                Drag and drop is enabled on desktop. On mobile, use up/down buttons.
              </p>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {GROUP_ORDER.map((group) => (
                  <div key={group} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                    <h3 className="mb-2 text-sm font-bold text-cyan-300">Group {group} Ranking</h3>
                    <div className="space-y-2">
                      {manualGroupRankings[group].map((team, index) => (
                        <div
                          key={team.name}
                          draggable
                          onDragStart={() => onGroupDragStart(group, index)}
                          onDragOver={(e) => onGroupDragOver(e, group, index)}
                          onDrop={() => onGroupDrop(group, index)}
                          onDragEnd={onGroupDragEnd}
                          className={`flex items-center justify-between rounded-lg border px-2 py-2 text-sm transition-all duration-200 ease-out ${
                            draggingTeam?.group === group && draggingTeam.index === index
                              ? "scale-[0.98] border-cyan-400 bg-cyan-500/20 opacity-70"
                              : dragOverTarget?.group === group && dragOverTarget.index === index
                                ? "border-emerald-400 bg-emerald-500/20"
                                : rankColorClass(index)
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="select-none text-slate-400">::</span>
                            {index + 1}. <TeamLabel teamName={team.name} />
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveTeamInGroup(group, index, -1)}
                              disabled={index === 0}
                              className="rounded bg-slate-700 px-2 py-1 disabled:opacity-40"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveTeamInGroup(group, index, 1)}
                              disabled={index === 3}
                              className="rounded bg-slate-700 px-2 py-1 disabled:opacity-40"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
                <h3 className="text-sm font-bold text-amber-200">Select Best 8 Third-Placed Teams</h3>
                <p className="mt-1 text-xs text-slate-300">
                  انتخاب شده: {selectedBestThirdGroups.length} از 8
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {manualThirdCandidates.map(({ group, team }) => {
                    const selected = selectedBestThirdGroups.includes(group);
                    return (
                      <button
                        key={group}
                        onClick={() => toggleBestThirdGroup(group)}
                        className={`rounded-lg border px-2 py-2 text-left text-sm ${
                          selected
                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                            : "border-slate-600 bg-slate-800/70 text-slate-200"
                        }`}
                      >
                        Group {group}: {team.name}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={autoPickBestThirdsByStrength}
                    className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold"
                  >
                    Auto Pick by Strength
                  </button>
                  <button
                    onClick={finalizeManualRankings}
                    disabled={selectedBestThirdGroups.length !== 8}
                    className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Confirm Rankings and Build R32
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {GROUP_ORDER.map((group) => (
              <div key={group} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                <h3 className="mb-2 text-sm font-bold text-emerald-300">Group {group}</h3>
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="pb-1">#</th>
                      <th className="pb-1">Team</th>
                      <th className="pb-1 text-right">STR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(groupStageMode === "manual-ranking" && !groupDone
                      ? manualGroupRankings[group]
                      : GROUPS[group]
                    ).map((team, index) => (
                      <tr key={team.name} className={`border-t ${rankColorClass(index)}`}>
                        <td className="py-1.5">{index + 1}</td>
                        <td className="py-1.5"><TeamLabel teamName={team.name} /></td>
                        <td className="py-1.5 text-right text-slate-300">{team.strength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {groupDone && standingsByGroup && (
          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-emerald-300 sm:text-xl">
              Group Stage Complete - Advancing Teams
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {GROUP_ORDER.map((group) => {
                const table = standingsByGroup[group];
                return (
                  <div key={group} className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
                    <h3 className="mb-2 text-sm font-bold text-cyan-300">Group {group}</h3>
                    <table className="w-full text-xs sm:text-sm">
                      <thead className="text-slate-400">
                        <tr>
                          <th className="text-left">Team</th>
                          <th className="text-right">Rank</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.map((row, idx) => (
                          <tr
                            key={row.team.name}
                            className={`border-t ${rankColorClass(idx)}`}
                          >
                            <td className="py-1"><TeamLabel teamName={row.team.name} /></td>
                            <td className="py-1 text-right">{idx + 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <h3 className="text-sm font-bold text-amber-200">Best Third-Placed Teams (Top 8)</h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {qualifiedThirds.map((t, idx) => (
                  <div key={t.team.name} className="rounded-lg bg-slate-800/70 p-2 text-sm">
                    {idx + 1}. <TeamLabel teamName={t.team.name} /> (Group {t.team.group})
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {groupDone && bracket && (
          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-emerald-300 sm:text-xl">Knockout Bracket</h2>

            {knockoutMode === "manual" && activeManualMatch && !champion && (
              <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                <p className="text-sm font-semibold text-emerald-200">
                  {activeRound} - Match {activeMatchIndex + 1} of {bracket[activeRound].length}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  براي انتخاب برنده، مستقيما روي تيم فعال در خود براکت کليک کن.
                </p>
              </div>
            )}

            <div className="wc-bc mt-5">
              <div className="wc-bk">
                {renderRoundColumn("Round of 32", "left", "r32", leftR32)}
                {renderRoundColumn("Round of 16", "left", "r16", leftR16)}
                {renderRoundColumn("Quarter-Finals", "left", "qf", leftQF)}
                {renderRoundColumn("Semi-Final", "left", "sf", leftSF ? [leftSF] : [])}

                <div className="wc-fc">
                  <div className="wc-rl">Final</div>
                  {renderMatchCard(bracket.Final[0], "final")}
                  <div className="wc-champ">Champion: {champion ? champion.name : "Pick your winner"}</div>
                  <div className="wc-trophy" aria-hidden="true">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 8H42V21C42 28.18 37.08 34.44 30 36V42H34C38.42 42 42 45.58 42 50V52H22V50C22 45.58 25.58 42 30 42V36C22.92 34.44 18 28.18 18 21V8H22Z" fill="url(#cupBody)" />
                      <path d="M18 12H12C9.79 12 8 13.79 8 16V17C8 22.52 12.48 27 18 27" stroke="url(#cupStroke)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M46 12H52C54.21 12 56 13.79 56 16V17C56 22.52 51.52 27 46 27" stroke="url(#cupStroke)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M22 52H42" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="32" cy="18" r="6" fill="#FEF08A" fillOpacity="0.55" />
                      <defs>
                        <linearGradient id="cupBody" x1="18" y1="8" x2="46" y2="52" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FDE68A" />
                          <stop offset="0.45" stopColor="#F59E0B" />
                          <stop offset="1" stopColor="#B45309" />
                        </linearGradient>
                        <linearGradient id="cupStroke" x1="8" y1="12" x2="56" y2="27" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#FDE68A" />
                          <stop offset="1" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {renderRoundColumn("Semi-Final", "right", "sf", rightSF ? [rightSF] : [])}
                {renderRoundColumn("Quarter-Finals", "right", "qf", rightQF)}
                {renderRoundColumn("Round of 16", "right", "r16", rightR16)}
                {renderRoundColumn("Round of 32", "right", "r32", rightR32)}
                </div>
              </div>

            <style>{`
              .wc-bc {
                overflow-x: auto;
                padding-bottom: 8px;
              }

              .wc-bk {
                min-width: 1080px;
                display: flex;
                gap: 10px;
                align-items: flex-start;
              }

              .wc-rd {
                position: relative;
                width: 142px;
                display: flex;
                flex-direction: column;
              }

              .wc-rd.r32 {
                --pair-gap: 12px;
              }

              .wc-rd.r16 {
                --pair-gap: 42px;
                margin-top: 22px;
              }

              .wc-rd.qf {
                --pair-gap: 92px;
                margin-top: 52px;
              }

              .wc-rd.sf {
                --pair-gap: 0px;
                margin-top: 100px;
              }

              .wc-rl {
                margin-bottom: 10px;
                font-size: 12px;
                font-weight: 800;
                letter-spacing: 0.03em;
                color: #9deccf;
                text-transform: uppercase;
              }

              .wc-m {
                position: relative;
                display: flex;
                flex-direction: column;
                gap: 2px;
                margin-bottom: var(--pair-gap, 16px);
              }

              .wc-rd.r32 .wc-m:last-child,
              .wc-rd.r16 .wc-m:last-child,
              .wc-rd.qf .wc-m:last-child,
              .wc-rd.sf .wc-m:last-child {
                margin-bottom: 0;
              }

              .wc-mt {
                display: flex;
                align-items: center;
                min-height: 34px;
                border: 1px solid rgba(148, 163, 184, 0.55);
                background: rgba(15, 23, 42, 0.9);
                color: #f8fafc;
                border-radius: 8px;
                padding: 6px 8px;
                text-align: left;
                font-size: 12px;
              }

              .wc-mt.pickable {
                cursor: pointer;
                transition: all 0.18s ease;
              }

              .wc-mt.pickable:hover {
                background: rgba(6, 95, 70, 0.75);
                border-color: rgba(52, 211, 153, 0.85);
              }

              .wc-mt.winner {
                background: rgba(6, 95, 70, 0.8);
                border-color: rgba(74, 222, 128, 0.95);
                box-shadow: inset 0 0 0 1px rgba(167, 243, 208, 0.45);
              }

              .wc-m.is-active .wc-mt {
                border-color: rgba(250, 204, 21, 0.95);
                box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.45);
              }

              .wc-m.empty .wc-mt {
                color: #94a3b8;
                opacity: 0.7;
              }

              .wc-fc {
                width: 164px;
                margin-top: 86px;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                min-height: 320px;
              }

              .wc-fc .wc-m {
                margin-bottom: 10px;
              }

              .wc-champ {
                margin-top: 8px;
                border: 1px solid rgba(250, 204, 21, 0.45);
                background: rgba(250, 204, 21, 0.12);
                color: #fde68a;
                font-weight: 700;
                border-radius: 10px;
                padding: 8px 10px;
                font-size: 12px;
              }

              .wc-trophy {
                margin-top: 12px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex: 1;
                min-height: 210px;
                padding: 8px 0 0;
              }

              .wc-trophy svg {
                width: 132px;
                height: 200px;
                filter: drop-shadow(0 12px 22px rgba(245, 158, 11, 0.3));
              }

              @media (max-width: 1200px) {
                .wc-bk {
                  min-width: 960px;
                  gap: 8px;
                }

                .wc-rd {
                  width: 128px;
                }

                .wc-fc {
                  width: 150px;
                  min-height: 280px;
                }

                .wc-rd.r16 {
                  --pair-gap: 34px;
                  margin-top: 18px;
                }

                .wc-rd.qf {
                  --pair-gap: 72px;
                  margin-top: 42px;
                }

                .wc-rd.sf {
                  margin-top: 82px;
                }

                .wc-trophy {
                  min-height: 180px;
                }

                .wc-trophy svg {
                  width: 112px;
                  height: 170px;
                }
              }
            `}</style>
          </section>
        )}

        {champion && (
          <section className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 sm:p-6">
            <h2 className="text-xl font-black text-emerald-300 sm:text-2xl">Tournament Complete</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-900/70 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Champion</p>
                <p className="text-lg font-bold text-emerald-200">{champion.name}</p>
              </div>
              <div className="rounded-xl bg-slate-900/70 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Runner-Up</p>
                <p className="text-lg font-bold text-cyan-200">{runnerUp?.name ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-slate-900/70 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Top Scorer</p>
                <p className="text-lg font-bold text-amber-200">
                  {topScorer ? `${topScorer.name} (${topScorer.goals})` : "-"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/70 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Upsets</p>
                <p className="text-lg font-bold text-fuchsia-200">{upsets}</p>
              </div>
            </div>
          </section>
        )}

        <footer className="pb-3 text-xs text-slate-400">
          Teams loaded: {allTeams.length}. Constraint enforced: same-group teams are separated across R32 and R16 paths.
        </footer>
      </div>
    </main>
  );
}

export default WorldCupSimulatorPage;

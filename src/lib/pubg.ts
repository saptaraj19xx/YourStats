
const PUBG_API_BASE_URL =
  process.env.PUBG_API_BASE_URL || "https://api.pubg.com";

const PUBG_API_KEY = process.env.PUBG_API_KEY;

// ==========================================
// PUBG MAP NAME CONVERSION
// ==========================================

export const MAP_NAMES: Record<string, string> = {
  Baltic_Main: "Erangel",
  Erangel_Main: "Erangel",
  Desert_Main: "Miramar",
  Savage_Main: "Sanhok",
  DihorOtok_Main: "Vikendi",
  Tiger_Main: "Taego",
  Neon_Main: "Rondo",
  Kiki_Main: "Deston",
  Chimera_Main: "Paramo",
  Summerland_Main: "Karakin",
  Heaven_Main: "Haven",
  Range_Main: "Camp Jackal",
};

export function getMapDisplayName(mapId: string): string {
  return MAP_NAMES[mapId] ?? mapId
    .replace(/_Main$/i, "")
    .replaceAll("_", " ");
}

// ==========================================
// TYPES
// ==========================================

export type PubgGameModeStats = {
  roundsPlayed?: number;
  wins?: number;
  kills?: number;
  deaths?: number;
  damageDealt?: number;
  headshotKills?: number;
  assists?: number;
  top10s?: number;
  longestKill?: number;
  [key: string]: number | undefined;
};

export type PubgMatchSummary = {
  id: string;
  map: string;
  gameMode: string;
  createdAt: string;
  durationSeconds: number;
  placement: number | null;
  kills: number | null;
  assists: number | null;
  damage: number | null;
  headshotKills: number | null;
  survivalSeconds: number | null;
};

// ==========================================
// PUBG API REQUEST HANDLER
// ==========================================

export async function pubgRequest<T>(
  path: string,
  revalidate = 300
): Promise<T> {
  if (!PUBG_API_KEY) {
    throw new Error("PUBG_API_KEY_MISSING");
  }

  const response = await fetch(
    `${PUBG_API_BASE_URL}${path}`,
    {
      headers: {
        Authorization: `Bearer ${PUBG_API_KEY}`,
        Accept: "application/vnd.api+json",
      },
      next: { revalidate },
    }
  );

  if (response.status === 404) {
    throw new Error("PUBG_NOT_FOUND");
  }

  if (response.status === 429) {
    throw new Error("PUBG_RATE_LIMIT");
  }

  if (!response.ok) {
    const body = await response.text();

    console.error("PUBG API error:", {
      status: response.status,
      path,
      body,
    });

    throw new Error(`PUBG_HTTP_${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ==========================================
// PLAYER API RESPONSE TYPES
// ==========================================

type PlayerApiResponse = {
  data?: Array<{
    id: string;
    attributes: {
      name: string;
    };
    relationships?: {
      matches?: {
        data?: Array<{
          id: string;
        }>;
      };
    };
  }>;
};

type LifetimeApiResponse = {
  data?: {
    attributes?: {
      gameModeStats?: Record<
        string,
        PubgGameModeStats
      >;
    };
  };
};

// ==========================================
// FIND PUBG PLAYER
// ==========================================

export async function findPubgPlayer(
  playerName: string
) {
  const params = new URLSearchParams();

  params.set("filter[playerNames]", playerName);

  const playerResponse =
    await pubgRequest<PlayerApiResponse>(
      `/shards/steam/players?${params.toString()}`,
      300
    );

  const player = playerResponse.data?.[0];

  if (!player) {
    throw new Error("PLAYER_NOT_FOUND");
  }

  let lifetimeStats: Record<
    string,
    PubgGameModeStats
  > = {};

  let statsError: string | null = null;

  try {
    const statsResponse =
      await pubgRequest<LifetimeApiResponse>(
        `/shards/steam/players/${encodeURIComponent(
          player.id
        )}/seasons/lifetime`,
        1800
      );

    lifetimeStats =
      statsResponse.data?.attributes?.gameModeStats ?? {};

    if (Object.keys(lifetimeStats).length === 0) {
      statsError =
        "PUBG returned no lifetime game mode statistics.";
    }
  } catch (error) {
    statsError =
      error instanceof Error
        ? error.message
        : "Lifetime stats request failed.";

    console.error(
      "Lifetime stats unavailable:",
      statsError
    );
  }

  const recentMatches =
    player.relationships?.matches?.data ?? [];

  return {
    id: player.id,
    name: player.attributes.name,
    platform: "PC · Steam",

    lifetimeStats,

    statsAvailable:
      Object.keys(lifetimeStats).length > 0,

    statsError,

    recentMatchIds: recentMatches.map(
      (match) => match.id
    ),

    recentMatchCount: recentMatches.length,
  };
}

// ==========================================
// MATCH API RESPONSE TYPES
// ==========================================

type MatchApiResponse = {
  data?: {
    id: string;
    attributes?: {
      mapName?: string;
      gameMode?: string;
      createdAt?: string;
      duration?: number;
    };
  };

  included?: Array<{
    type: string;
    attributes?: {
      stats?: Record<string, unknown>;
    };
  }>;
};

// ==========================================
// FETCH PLAYER RECENT MATCHES
// ==========================================

export async function getPlayerRecentMatches(
  matchIds: string[],
  playerId: string
): Promise<PubgMatchSummary[]> {

  // Limit requests to protect the PUBG API rate limit.
  const selectedIds = matchIds.slice(0, 6);

  const matches = await Promise.all(
    selectedIds.map(async (matchId) => {
      try {
        const match =
          await pubgRequest<MatchApiResponse>(
            `/shards/steam/matches/${encodeURIComponent(
              matchId
            )}`,
            3600
          );

        // Find this player's participant data.
        const participant =
          match.included?.find(
            (item) =>
              item.type === "participant" &&
              String(
                item.attributes?.stats?.playerId ?? ""
              ) === playerId
          );

        const stats =
          participant?.attributes?.stats ?? {};

        // Safely extract numerical statistics.
        const num = (
          key: string
        ): number | null => {
          const value = stats[key];

          return typeof value === "number"
            ? value
            : null;
        };

        const rawMap =
          match.data?.attributes?.mapName ??
          "Unknown map";

        return {
          id: match.data?.id ?? matchId,

          // Convert PUBG internal map IDs to real names.
          map: getMapDisplayName(rawMap),

          gameMode:
            match.data?.attributes?.gameMode ??
            "Unknown mode",

          createdAt:
            match.data?.attributes?.createdAt ?? "",

          durationSeconds:
            match.data?.attributes?.duration ?? 0,

          placement: num("winPlace"),
          kills: num("kills"),
          assists: num("assists"),
          damage: num("damageDealt"),
          headshotKills: num("headshotKills"),
          survivalSeconds: num("timeSurvived"),

        } satisfies PubgMatchSummary;

      } catch (error) {
        console.error(
          "Could not load match:",
          matchId,
          error
        );

        return null;
      }
    })
  );

  return matches.filter(
    (match): match is PubgMatchSummary =>
      match !== null
  );
}

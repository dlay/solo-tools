export interface MapData {
  id: string;
  displayName: string;
  worldIconUrl: string;
  worldIconPosition: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  dungeons: Array<Dungeon>;
  collectables: Array<Collectable>;
  materials: Array<GatherMaterial>;
  fish: Array<Fish>;
  showMapName: boolean;
  subMaps: Array<string>;
}

export interface Dungeon {
  name: string;
  playerCountMin: number;
  playerCountMax: number;
}

export interface Collectable {
  name: string;
  smallIconName: string;
  bigIconName: string;
}

export interface GatherMaterial {
  name: string;
  isGathering: boolean;
  smallIconUrl?: string;
  bigIconUrl: string;
  gold?: boolean;
}

export interface Fish {
  name: string;
  smallIconUrl?: string;
  bigIconUrl: string;
  gold?: boolean;
}

export interface MapMarker {
  uid: string;
  position: { top: number, left: number };
  type: string;
  map: string;
  description?: string;
  material?: string;
  collectable?: Collectable;
  fish?: string;
  hunt?: {
    difficulty: number;
    bossName: string;
    gearScore: number;
    bossInformation: string;
    rewards: Array<{ item: Item, quantityMin: number, quantityMax: number }>;
    reset: ResetTime;
  };
  dungeon?: {
    uid: string;
    name: string;
    playerMin: number;
    playerMax: number;
    bigIconUrl: string;
    versions: {
      drill: { rewards: Array<{ item: Item, quantityMin: number, quantityMax: number }>, reset: ResetTime, gearScore: number, gearScoreLoot: number }
      easy: { rewards: Array<{ item: Item, quantityMin: number, quantityMax: number }>, reset: ResetTime, gearScore: number, gearScoreLoot: number }
      normal: { rewards: Array<{ item: Item, quantityMin: number, quantityMax: number }>, reset: ResetTime, gearScore: number, gearScoreLoot: number }
      hard: { rewards: Array<{ item: Item, quantityMin: number, quantityMax: number }>, reset: ResetTime, gearScore: number, gearScoreLoot: number }
      extreme: { rewards: Array<{ item: Item, quantityMin: number, quantityMax: number }>, reset: ResetTime, gearScore: number, gearScoreLoot: number }
    }
  };
  timestamp?: Date;
}

export interface Item {
  name: string;
  uid: string;
  iconUrl: string;
}

export enum ResetTime {
  daily = 0,
  sunday = 1,
  thursday = 2,
  free = 3,
  thursdayAndSunday = 4
}

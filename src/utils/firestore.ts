export type Team = {
  id: string;
  name: string;
  color: string;
  count: number;
};

export type Game = {
  name: string;
  maxCount?: number;
  teams: Team[];
  ts: number;
};

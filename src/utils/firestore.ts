export type Team = {
  id: string;
  name: string;
  color: string;
  count: number;
};

export type Game = {
  id: string;
  name: string;
  maxCount?: number;
  ts: number;
};

export type MoodType =
  | "平静"
  | "疲惫"
  | "开心"
  | "焦虑"
  | "想念"
  | "混乱"
  | "委屈"
  | "期待";

export type GardenState = {
  soil: string;
  light: string;
  vitality: string;
  connection: string;
};

export type TimelineRecord = {
  date: string;
  change: string;
  note: string;
};
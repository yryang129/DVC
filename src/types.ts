export type Resort = {
  name: string;
  shortName: string;
  image: string;
};

export type EstimateData = {
  resort: Resort;
  contractPoints: number;
  pointsByYear: Record<string, number>;
  useYear: string;
};

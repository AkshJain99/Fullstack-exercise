export enum CommuteMode {
    UNKNOWN = "unknown",
    WALK = "walk",
    BIKE = "bike",
    BUS = "bus",
    CAR = "car",
    TRAIN = "train",
    MOTORBIKE = "motorbike",
  }
  
  export interface TotalByMode {
    mode: CommuteMode;
    total_kg_co2e: number;
  }
  
  export interface Scenario {
    one_way_distance: number;
    commute_days_per_year: number;
    primary_mode: CommuteMode;
    secondary_mode: CommuteMode;
    primary_mode_proportion: number;
    secondary_mode_proportion: number;
  }
  
  export interface SimulationResult {
    scenario: Scenario;
    total_kg_co2e: number;
    total_kg_co2e_per_mode: TotalByMode[];
  }
  
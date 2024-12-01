export interface TwitchPlusStatusResponse {
  data: {
    plusStatus: TwitchPlusStatus;
  };
}

export interface TwitchPlusStatus {
  partnerPlusProgram: TwitchPartnerPlusProgram;
}

export interface TwitchPartnerPlusProgram {
  isQualified: boolean;
  threshold: number;
  canShowWidget: boolean;
  subPoints: TwitchSubPoint[];
  widgetSetting: string;
  __typename: string;
}

export interface TwitchPlusData {
  isQualified: boolean;
  threshold: number;
  canShowWidget: boolean;
  subPoints: TwitchSubPoint[];
  widgetSetting: string;
}

export interface TwitchSubPoint {
  year: number;
  month: number;
  count: number;
  updatedAt: string | null;
}


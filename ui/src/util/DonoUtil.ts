import { UserDonoSummaries, UserDonoSummary } from "../service/HoagieClient";

export class DonoUtil {
  public static getEligibleDonos(
    donos: UserDonoSummaries,
    valueThreshold: number
  ): { eligible: UserDonoSummary[]; notEligible: UserDonoSummary[] } {
    const eligible =
      Object.values(donos)?.filter((dono) => dono.value >= valueThreshold) ?? [];
    const notEligible =
      Object.values(donos)?.filter((dono) => dono.value < valueThreshold) ?? [];
    return { eligible, notEligible };
  }
}

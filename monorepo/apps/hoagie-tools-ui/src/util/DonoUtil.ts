import { UserDonoSummaries, UserDonoSummary } from "@hoagie/dono-service";

export class DonoUtil {
  public static getEligibleDonos(
    donos: UserDonoSummaries,
    valueThreshold: number
  ): { eligible: UserDonoSummary[]; notEligible: UserDonoSummary[] } {
    const allDonos = Object.values(donos).sort((a, b) => a.username.localeCompare(b.username));
    const eligible =
    allDonos?.filter((dono) => dono.value >= valueThreshold) ?? [];
    const notEligible =
    allDonos?.filter((dono) => dono.value < valueThreshold) ?? [];
    return { eligible, notEligible };
  }
}

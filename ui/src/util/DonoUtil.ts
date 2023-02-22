import { DonoData } from "../service/HoagieClient";

export class DonoUtil {
    public static getEligibleDonos(donos: DonoData[], valueThreshold: number) {
        const eligible = donos?.filter(dono => dono.value >= valueThreshold) ?? [];
        const notEligible = donos?.filter(dono => dono.value < valueThreshold) ?? [];
        return { eligible, notEligible }
    }
}

import axios from 'axios';

export class ModsClientV2 {
  private userId: string;
  private accessToken: string;

  public constructor(userId: string, accessToken: string) {
    this.userId = userId;
    this.accessToken = accessToken;
  }

  readonly LEGACY_BASE_URL = (() => {
    const urlParams = new URLSearchParams(window.location.search);
    return !!urlParams.get("dev") ? 'https://hoagietools-svc-development.hoagieman.net/api/' : 'https://hoagietools-svc-prod.hoagieman.net/api/';
  })();

  public async getMods(streamerId: string) {
    const response = await axios.get(`${this.LEGACY_BASE_URL}mods?streamerId=${streamerId}`, {
        headers: this.getHeaders()
    });
    return response?.data;
  }

  public async addMod(streamerId: string, modId: string) {
    const response = await axios.put(`${this.LEGACY_BASE_URL}addmod?userId=${modId}&streamerId=${streamerId}`, {}, {
        headers: this.getHeaders(),
    });
    return response?.data;
  }

  public async removeMod(streamerId: string, modId: string) {
    const response = await axios.put(`${this.LEGACY_BASE_URL}removemod?userId=${modId}&streamerId=${streamerId}`, {}, {
        headers: this.getHeaders()
    });
    return response?.data;
  }

  getHeaders() {
    const token = btoa(`${this.userId}:${this.accessToken}`)
    return  {
        "Authorization": `Basic ${token}`
    }
  }
}

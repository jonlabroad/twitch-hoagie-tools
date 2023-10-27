import atob from 'atob';

export namespace BasicAuth {
  export function decode(authHeader: string) {
    if (!authHeader) {
      console.error('Missing auth header');
      return {
        username: "",
        token: "",
      };
    }

    const decoded = atob(authHeader.replace('Basic ', ''));
    const usernameToken = decoded.split(':');
    return {
      username: usernameToken[0],
      token: usernameToken[1],
    };
  }
}

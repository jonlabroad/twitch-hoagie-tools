export const createCacheHeader = (maxAge: number) => {
  return {
    'Cache-Control': `max-age=${maxAge}`,
  };
};

export const noCacheHeaders = {
  'Cache-Control': 'no-cache',
};

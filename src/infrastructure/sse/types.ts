export type MessageEvent<
  D extends number | object | string,
  T extends string,
> = {
  data: D;
  id: number | string;
  retry?: number;
  type?: T;
};

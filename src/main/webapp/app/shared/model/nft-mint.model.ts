export interface INFTMint {
  id?: number;
  name?: string | null;
  unitName?: string | null;
  desc?: string | null;
  media?: string | null;
  password?: string | null;
}

export const defaultValue: Readonly<INFTMint> = {};

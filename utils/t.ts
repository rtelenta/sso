import messages from "@/locales/en.json";

type Messages = typeof messages;

type DotPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? DotPaths<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

type TranslationKey = DotPaths<Messages>;

export function t(key: TranslationKey): string {
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = messages;
  for (const part of parts) {
    node = node?.[part];
  }
  return typeof node === "string" ? node : key;
}

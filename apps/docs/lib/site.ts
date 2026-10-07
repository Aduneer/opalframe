// Next inlines this public value into client bundles at build time.
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
  /\/$/,
  "",
);

export function assetPath(path: string) {
  return `${basePath}${path}`;
}

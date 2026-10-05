// v1 serves local assets only, with GitHub Pages' project base path.
export function imageUrl(path: string | null | undefined) {
  if (!path) return undefined;
  const relative = path.replace(/^\//, "");
  if (!relative || relative.includes("..") || /[:\\?#]/.test(relative))
    return undefined;
  return `${import.meta.env.BASE_URL}${relative}`;
}

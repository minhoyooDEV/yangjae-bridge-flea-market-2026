// Supabase setup and access are deferred until the 2.x.x implementation.
// Deliberately no environment-variable override in the 1.x.x release.
export function requireBackendAccess(): never {
  throw new Error(
    "Supabase is disabled in 1.x.x. Setup and access start in 2.x.x.",
  );
}

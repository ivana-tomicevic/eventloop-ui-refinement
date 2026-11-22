import { redirect } from "next/navigation";
import { legacyQuery, type LegacyParams } from "@/components/legacy-routes";

/** Old "Make it yours." step: vibes are now a modal ("My vibes" in the account menu). */
export default async function Page({ searchParams }: LegacyParams) {
  const q = await searchParams;
  redirect(`/all-set${legacyQuery(q.next)}`);
}

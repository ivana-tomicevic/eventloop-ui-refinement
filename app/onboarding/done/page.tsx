import { redirect } from "next/navigation";
import { legacyQuery, type LegacyParams } from "@/components/legacy-routes";

/** Old "You're all set." route, now /all-set. */
export default async function Page({ searchParams }: LegacyParams) {
  const q = await searchParams;
  redirect(
    q.as === "host" ? "/all-set?as=host" : `/all-set${legacyQuery(q.next)}`,
  );
}

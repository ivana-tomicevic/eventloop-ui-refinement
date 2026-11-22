import { redirect } from "next/navigation";
import { legacyQuery, type LegacyParams } from "@/components/legacy-routes";

/** Old "How will you use Eventloop?" screen: the welcome flow now goes straight to /all-set. */
export default async function Page({ searchParams }: LegacyParams) {
  const q = await searchParams;
  redirect(
    q.host === "1" ? "/organizer/setup" : `/all-set${legacyQuery(q.next)}`,
  );
}

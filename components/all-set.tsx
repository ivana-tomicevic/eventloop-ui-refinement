"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import Confetti from "./confetti";
import OnboardingShell from "./onboarding-shell";
import {
  authUrl,
  currentUserId,
  eventToReturnTo,
  firstName,
  isSignedIn,
  markOnboarded,
  safeNext,
} from "./auth";

/** Decorative photos around the card on desktop. Only clean shots: no visible text or logos. */
const PHOTOS = [
  "/photos/events/pottery.jpg",
  "/photos/events/retiro-walk.jpg",
  "/photos/events/open-studio.jpg",
  "/photos/events/language-swap.jpg",
];
const photos = (
  <div className="el-allset__photos" aria-hidden="true">
    {PHOTOS.map((src, i) => (
      <span key={src} className={`el-allset__photo el-allset__photo--${i + 1}`}>
        <Image src={src} alt="" fill sizes="180px" className="object-cover" />
      </span>
    ))}
  </div>
);

/**
 * /all-set?next=/path — "Welcome to Eventloop." right after sign up (finishes the one-time setup).
 * Started from "Get tickets": "Back to your event". ?as=host (after the host profile):
 * "Create my first event" + "Skip for now".
 */
export default function AllSet() {
  const [ready, setReady] = useState(false);
  const [host, setHost] = useState(false);
  const [next, setNext] = useState("/");
  const [name, setName] = useState("");
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const target = safeNext(q.get("next"));
    if (!isSignedIn()) {
      window.location.replace(authUrl(target, { mode: "signup" }));
      return;
    }
    markOnboarded();
    setHost(q.get("as") === "host");
    setNext(target);
    setName(firstName());
    // Confetti once per account.
    const key = `eventloop-confetti-shown:${currentUserId()}`;
    try {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
        setConfetti(true);
      }
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return <OnboardingShell />;

  // Signed up from an event ("Get tickets" / "Save your spot"): go back to it.
  const backToEvent = eventToReturnTo(next);

  return (
    <OnboardingShell
      labelledBy="done-title"
      className="el-allset"
      decor={photos}
    >
      {confetti && <Confetti />}
      <span className="el-allset__check" aria-hidden="true">
        <Check />
      </span>
      <h1 id="done-title" className="el-shell__title">
        {name ? `Welcome to Eventloop, ${name}.` : "Welcome to Eventloop."}
      </h1>
      <p className="el-shell__lead">{"You're all set. Madrid, your way."}</p>
      {host ? (
        <div className="el-allset__actions">
          <a
            className="el-details__cta el-join__submit"
            href="/organizer/create"
          >
            Create my first event
          </a>
          <a className="el-shell__skip" href="/organizer">
            Skip for now
          </a>
        </div>
      ) : (
        <div className="el-allset__actions">
          <a
            className="el-details__cta el-join__submit"
            href={backToEvent || next}
          >
            {backToEvent ? "Back to your event" : "Start exploring"}
          </a>
        </div>
      )}
    </OnboardingShell>
  );
}

"use client";
import { useEffect, useState, type FormEvent } from "react";
import { MapPin } from "lucide-react";
import { NEIGHBOURHOODS } from "./vibes";
import { readHostProfile, saveHostProfile } from "./host";
import { authUrl, isHosting, isSignedIn, startHosting } from "./auth";
import OnboardingShell from "./onboarding-shell";
import FieldError from "./field-error";

/** Where to go after editing: the workspace while hosting, otherwise Explore. */
const back = () => (isHosting() ? "/organizer" : "/");

type Errors = { name?: string; area?: string };

/**
 * /organizer/setup — the host profile card: after "Sign up as a host", "Become a host" or
 * "Host an event" (first time), then the welcome screen. ?edit=1 is "Host profile" from the menu.
 */
export default function HostSetup() {
  const [editing, setEditing] = useState(false);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [about, setAbout] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const edit =
      new URLSearchParams(window.location.search).get("edit") === "1";
    // Shown once: with a profile saved, go straight to the workspace.
    if (!edit && readHostProfile()) {
      window.location.replace("/organizer/events");
      return;
    }
    if (!isSignedIn()) {
      window.location.replace(authUrl("/organizer", { host: true }));
      return;
    }
    // Opening the setup (not the edit from the menu) means choosing to host.
    if (!edit) startHosting();
    setEditing(edit);
    const p = readHostProfile();
    if (p) {
      setName(p.name);
      setArea(p.area);
      setAbout(p.about || "");
    }
    setReady(true);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (!name.trim()) found.name = "Add a name people will know you by.";
    if (!area) found.area = "Pick your neighbourhood.";
    setErrors(found);
    if (found.name || found.area) {
      document.getElementById(found.name ? "host-name" : "host-area")?.focus();
      return;
    }
    saveHostProfile({ name: name.trim(), area, about: about.trim() });
    // First time: "You're all set." (Create my first event / Skip for now).
    window.location.assign(editing ? back() : "/all-set?as=host");
  };

  if (!ready) return <OnboardingShell />;

  return (
    <OnboardingShell labelledBy="host-title">
      <h1 id="host-title" className="el-shell__title">
        {editing ? "Your host profile" : "Set up your host profile"}
      </h1>
      <p className="el-shell__lead">
        This is how people see you on your events.
      </p>
      <form className="el-join__form" onSubmit={submit} noValidate>
        <label className="el-join__field">
          {"Who's hosting?"}
          <input
            id="host-name"
            value={name}
            maxLength={60}
            placeholder="Your name or your place"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "host-name-error" : undefined}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((x) => ({ ...x, name: undefined }));
            }}
          />
          {errors.name && (
            <FieldError id="host-name-error">{errors.name}</FieldError>
          )}
        </label>

        <fieldset
          className="el-create__fieldset"
          aria-describedby={errors.area ? "host-area-error" : undefined}
        >
          <legend>Where are you based?</legend>
          <div className="el-vibes__row el-shell__chips">
            {NEIGHBOURHOODS.map((n, i) => (
              <button
                type="button"
                key={n}
                id={i === 0 ? "host-area" : undefined}
                className="el-vibe el-vibe--area"
                aria-pressed={area === n}
                onClick={() => {
                  setArea(n);
                  setErrors((x) => ({ ...x, area: undefined }));
                }}
              >
                <MapPin aria-hidden="true" />
                {n}
              </button>
            ))}
          </div>
          {errors.area && (
            <FieldError id="host-area-error">{errors.area}</FieldError>
          )}
        </fieldset>

        <label className="el-join__field">
          About (optional)
          <textarea
            rows={3}
            maxLength={160}
            value={about}
            placeholder="One line about you or your place"
            onChange={(e) => setAbout(e.target.value)}
          />
        </label>

        <div className="el-allset__actions">
          <button type="submit" className="el-details__cta el-join__submit">
            {editing ? "Save profile" : "Continue"}
          </button>
          {editing && (
            <a className="el-shell__skip" href={back()}>
              Cancel
            </a>
          )}
        </div>
      </form>
    </OnboardingShell>
  );
}

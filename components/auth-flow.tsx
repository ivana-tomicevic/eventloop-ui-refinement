"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  authenticate,
  authUrl,
  providerEmail,
  safeNext,
  type AuthResult,
  type Provider,
} from "./auth";
import OnboardingShell from "./onboarding-shell";
import FieldError from "./field-error";

/* Official marks, as each provider's brand guidelines ask: the multicolour Google "G" and the
   Apple logo in the button's text colour. These colours are the only ones not from tokens. */
function GoogleLogo() {
  return (
    <svg
      className="el-auth__logo-mark"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.8 7.18l7.73 6c4.51-4.18 7.11-10.33 7.11-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.89 23.89 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
function AppleLogo() {
  return (
    <svg
      className="el-auth__logo-mark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.05 12.54c.02 2.4 2.11 3.2 2.13 3.21-.02.05-.33 1.13-1.1 2.25-.67.96-1.36 1.91-2.45 1.93-1.08.02-1.42-.63-2.65-.63-1.22 0-1.6.61-2.62.65-1.05.04-1.85-1.05-2.52-2.01-1.37-1.98-2.42-5.6-1.01-8.05.7-1.22 1.96-2 3.33-2.02 1.04-.02 2.02.7 2.65.7.63 0 1.82-.87 3.07-.74.52.02 1.98.21 2.92 1.58-.08.05-1.74 1.01-1.72 3.13zM15.98 5.5c.56-.68.94-1.62.84-2.56-.8.03-1.78.53-2.36 1.21-.52.59-.98 1.55-.86 2.46.9.07 1.81-.46 2.38-1.11z" />
    </svg>
  );
}

type Mode = "login" | "signup";
type Field = "name" | "email" | "password";
type Errors = Partial<Record<Field, string>>;

function validate(mode: Mode, v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (mode === "signup" && !v.name.trim()) e.name = "What should we call you?";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "Enter a valid email.";
  if (mode === "signup" && v.password.length < 6)
    e.password = "At least 6 characters.";
  if (mode === "login" && !v.password) e.password = "Enter your password.";
  return e;
}

/**
 * /auth?mode=login|signup&next=/path[&host=1]: one card, Log in / Sign up. Demo only.
 * ?host=1 ("Sign up as a host"): the host profile comes before the welcome screen.
 * Switching modes keeps the card in place: the name field, the password hint and the host link
 * open and close (height + opacity, 200 ms), the title and button text cross-fade, focus moves
 * to the first field.
 */
export default function AuthFlow() {
  const [mode, setMode] = useState<Mode>("signup");
  const [next, setNext] = useState("/");
  const [host, setHost] = useState(false);
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  /** Email sign up for an existing account, or log in with an unknown email. */
  const [accountIssue, setAccountIssue] = useState<"exists" | "unknown" | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const switched = useRef(false);
  /** Animate only real switches, not the mode set from the URL on load. */
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("mode") === "login") setMode("login");
    setNext(safeNext(q.get("next")));
    setHost(q.get("host") === "1");
  }, []);
  // After a switch (not on first load), focus the first field of the new mode.
  useEffect(() => {
    if (!switched.current) return;
    document
      .getElementById(mode === "signup" ? "auth-name" : "auth-email")
      ?.focus();
  }, [mode]);

  const set = (k: Field, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    if (k === "email") setAccountIssue(null);
  };
  const switchTo = (m: Mode) => {
    switched.current = true;
    setAnimate(true);
    setMode(m);
    setErrors({});
    setAccountIssue(null);
  };

  const finish = (result: AuthResult) => {
    if (result.ok) window.location.assign(result.go);
    else {
      setAccountIssue(result.error);
      document.getElementById("auth-email")?.focus();
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(mode, values);
    setErrors(found);
    const first = (["name", "email", "password"] as Field[]).find(
      (k) => found[k],
    );
    if (first) {
      document.getElementById(`auth-${first}`)?.focus();
      return;
    }
    finish(
      authenticate({
        mode,
        email: values.email,
        name: values.name,
        host,
        next,
      }),
    );
  };

  // Demo: no OAuth. Signs in or up, then the same flow as email.
  const continueWith = (provider: Provider) =>
    finish(
      authenticate({
        mode: "provider",
        provider,
        email: providerEmail(provider),
        host,
        next,
      }),
    );

  const emailError = accountIssue
    ? "auth-email-account"
    : errors.email
      ? "auth-email-error"
      : undefined;
  const field = (k: Field) => ({
    id: `auth-${k}`,
    value: values[k],
    "aria-invalid":
      Boolean(errors[k]) || (k === "email" && Boolean(accountIssue)),
    "aria-describedby":
      k === "email" ? emailError : errors[k] ? `auth-${k}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      set(k, e.target.value),
  });
  const error = (k: Field) =>
    errors[k] ? (
      <FieldError id={`auth-${k}-error`}>{errors[k]}</FieldError>
    ) : null;
  const signup = mode === "signup";

  return (
    <OnboardingShell
      labelledBy="auth-title"
      className={"el-auth__card" + (animate ? " el-auth__card--animate" : "")}
    >
      <div
        className="el-time-filter el-auth__switch"
        role="group"
        aria-label="Log in or sign up"
      >
        <button
          type="button"
          aria-pressed={!signup}
          onClick={() => switchTo("login")}
        >
          Log in
        </button>
        <button
          type="button"
          aria-pressed={signup}
          onClick={() => switchTo("signup")}
        >
          Sign up
        </button>
      </div>
      <h1 id="auth-title" className="el-shell__title">
        <span key={mode} className="el-auth__fade">
          {signup
            ? host
              ? "Host on Eventloop."
              : "Join Eventloop."
            : "Welcome back."}
        </span>
      </h1>
      <p className="el-shell__lead">
        <span key={mode} className="el-auth__fade">
          {host
            ? signup
              ? "Sign up, then set up your host profile."
              : "Log in to get back to your events."
            : signup
              ? "Save events and grab tickets in a tap."
              : "Pick up where you left off."}
        </span>
      </p>
      <div className="el-auth__social">
        <button
          type="button"
          className="el-auth__provider"
          aria-label="Continue with Google (demo account)"
          onClick={() => continueWith("google")}
        >
          <GoogleLogo />
          Google
        </button>
        <button
          type="button"
          className="el-auth__provider"
          aria-label="Continue with Apple (demo account)"
          onClick={() => continueWith("apple")}
        >
          <AppleLogo />
          Apple
        </button>
      </div>
      <p className="el-pay__demo el-auth__demo">
        Demo account. No real sign-in.
      </p>
      <p className="el-auth__or">
        <span>or</span>
      </p>
      <form
        className={"el-join__form" + (signup ? "" : " el-auth__form--login")}
        onSubmit={submit}
        noValidate
      >
        {/* Sign up only: opens and closes instead of popping in. inert = skipped when closed. */}
        <div className="el-auth__reveal" data-open={signup} inert={!signup}>
          <div>
            <label className="el-join__field">
              Name
              <input
                {...field("name")}
                autoComplete="given-name"
                placeholder="Your name"
              />
              {error("name")}
            </label>
          </div>
        </div>
        <label className="el-join__field">
          Email
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
          />
          {error("email")}
          {accountIssue && (
            <FieldError id="auth-email-account">
              {accountIssue === "exists"
                ? "You already have an account. "
                : "No account with that email yet. "}
              <button
                type="button"
                className="el-auth__inline-link"
                onClick={() =>
                  switchTo(accountIssue === "exists" ? "login" : "signup")
                }
              >
                {accountIssue === "exists" ? "Log in" : "Sign up"}
              </button>
            </FieldError>
          )}
        </label>
        <label className="el-join__field">
          Password
          <span className="el-auth__password">
            <input
              {...field("password")}
              type={showPassword ? "text" : "password"}
              autoComplete={signup ? "new-password" : "current-password"}
              placeholder={signup ? "Create a password" : "Your password"}
              aria-describedby={
                errors.password
                  ? "auth-password-error"
                  : signup
                    ? "auth-password-hint"
                    : undefined
              }
            />
            <button
              type="button"
              className="el-org__icon"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </button>
          </span>
          {error("password") || (
            <span
              className="el-auth__reveal el-auth__reveal--hint"
              data-open={signup}
            >
              <span>
                <span className="el-join__hint" id="auth-password-hint">
                  At least 6 characters.
                </span>
              </span>
            </span>
          )}
        </label>
        <button type="submit" className="el-details__cta el-join__submit">
          <span key={mode} className="el-auth__fade">
            {signup ? "Sign up" : "Log in"}
          </span>
        </button>
      </form>
      {/* Sign up only, and not when already signing up as a host */}
      {!host && (
        <div
          className="el-auth__reveal el-auth__host"
          data-open={signup}
          inert={!signup}
        >
          <div>
            <p>
              Hosting events?{" "}
              <a
                className="el-details__map"
                href={authUrl(next, { mode: "signup", host: true })}
              >
                Sign up as a host
              </a>
            </p>
          </div>
        </div>
      )}
    </OnboardingShell>
  );
}

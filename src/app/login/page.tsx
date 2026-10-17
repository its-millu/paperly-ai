
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type AuthMode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const passwordStrength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "forgot") {
      setMessage(
        "The password reset form is ready. Connect an authentication backend to send a reset email.",
      );
      return;
    }

    if (mode === "signup") {
      if (!firstName.trim()) {
        setError("Please enter your first name.");
        return;
      }

      if (password.length < 8) {
        setError("Your password must contain at least 8 characters.");
        return;
      }

      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
        setError("Use at least one uppercase letter, one lowercase letter, and one number.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }

      if (!acceptedTerms) {
        setError("Please accept the Terms of Service and Privacy Policy.");
        return;
      }

      setMessage(
        "Your form is valid! Connect the backend to create your account securely.",
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setMessage(
      "Your form is valid! Connect the backend to sign in securely.",
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />

      <header className="auth-nav">
        <Link href="/" className="auth-brand" aria-label="Paperly home">
          <span className="auth-brand-icon">p.</span>
          <span>
            paperly<span>.</span>
          </span>
        </Link>

        <Link href="/" className="auth-back-link">
          <span>←</span> Back to home
        </Link>
      </header>

      <section className="auth-layout">
        <aside className="auth-story">
          <div className="auth-story-badge">
            <span>✳</span> YOUR WORLD, YOUR DAILY PAPER
          </div>

          <h1>
            A world of stories.
            <br />
            <span>Your point of view.</span>
          </h1>

          <p>
            Make room for what matters. Discover a more personal way to
            understand the world, one thoughtful edition at a time.
          </p>

          <div className="auth-benefits">
            <div className="auth-benefit">
              <span className="auth-benefit-icon">✳</span>
              <div>
                <strong>News tailored to you</strong>
                <p>Build an edition around your interests.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">▤</span>
              <div>
                <strong>Your reading space</strong>
                <p>Keep your daily news organized in one place.</p>
              </div>
            </div>

            <div className="auth-benefit">
              <span className="auth-benefit-icon">♡</span>
              <div>
                <strong>A little more perspective</strong>
                <p>Spend your time on stories worth exploring.</p>
              </div>
            </div>
          </div>

          <div className="auth-story-footer">
            <span className="auth-story-orbit">✳</span>
            <span>Less noise. More signal.</span>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-mark">✳</div>

          <div className="auth-heading">
            <span className="auth-eyebrow">
              {mode === "signup"
                ? "YOUR NEXT CHAPTER STARTS HERE"
                : mode === "forgot"
                  ? "LET'S GET YOU BACK IN"
                  : "WELCOME BACK"}
            </span>

            <h2>
              {mode === "signup"
                ? "Create your account"
                : mode === "forgot"
                  ? "Reset your password"
                  : "Good to see you."}
            </h2>

            <p>
              {mode === "signup"
                ? "Create your account and personalize your daily paper."
                : mode === "forgot"
                  ? "Enter your email to begin the password recovery process."
                  : "Sign in to return to your personal newspaper."}
            </p>
          </div>

          {mode !== "forgot" && (
            <div className="auth-mode-switch">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => changeMode("login")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => changeMode("signup")}
              >
                Sign up
              </button>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            
{mode === "signup" && (
  <div className="auth-name-grid">
    <div className="auth-field">
      <label htmlFor="firstName">First name</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.9 2.8-6 7-6s7 2.1 7 6" />
          </svg>
        </span>
        <input
          id="firstName"
          name="given-name"
          type="text"
          autoComplete="given-name"
          placeholder="First name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
        />
      </div>
    </div>

    <div className="auth-field">
      <label htmlFor="lastName">
        Last name <span>(optional)</span>
      </label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.9 2.8-6 7-6s7 2.1 7 6" />
          </svg>
        </span>
        <input
          id="lastName"
          name="family-name"
          type="text"
          autoComplete="family-name"
          placeholder="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>
    </div>
  </div>
)}


            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </svg>
</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      className="auth-text-action"
                      onClick={() => changeMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <div className="auth-input-wrap">
                  <span className="auth-input-icon">
<svg
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
>
  <rect
    x="5"
    y="10"
    width="14"
    height="11"
    rx="2.5"
    stroke="currentColor"
    strokeWidth="1.8"
  />
  <path
    d="M8 10V7a4 4 0 0 1 8 0v3"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />
  <circle cx="12" cy="15" r="1" fill="currentColor" />
  <path
    d="M12 16v2"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />
</svg>
</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {mode === "signup" && password.length > 0 && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <span
                          key={bar}
                          className={bar <= passwordStrength ? "filled" : ""}
                        />
                      ))}
                    </div>
                    <span>
                      {passwordStrength <= 2
                        ? "Keep strengthening your password"
                        : passwordStrength <= 4
                          ? "Getting stronger"
                          : "Strong password"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10" width="14" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
</span>
                  <input
                    id="confirmPassword"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="auth-visibility"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {confirmPassword.length > 0 && (
                  <p
                    className={
                      password === confirmPassword
                        ? "password-match match"
                        : "password-match"
                    }
                  >
                    {password === confirmPassword
                      ? "✓ Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>
            )}

            {mode === "login" && (
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>
            )}

            {mode === "signup" && (
              <label className="auth-checkbox auth-terms">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) =>
                    setAcceptedTerms(event.target.checked)
                  }
                />
                <span>
                  I agree to the <a href="#terms">Terms of Service</a> and{" "}
                  <a href="#privacy">Privacy Policy</a>.
                </span>
              </label>
            )}

            {error && (
              <div className="auth-feedback auth-error" role="alert">
                <span>!</span> {error}
              </div>
            )}

            {message && (
              <div className="auth-feedback auth-success" role="status">
                <span>✓</span> {message}
              </div>
            )}

            <button type="submit" className="auth-submit">
              {mode === "signup"
                ? "Create my account"
                : mode === "forgot"
                  ? "Continue"
                  : "Sign in to Paperly"}
              <span>↗</span>
            </button>

            <p className="auth-secure-note">
              <span>◇</span> Your account details should always be handled
              securely.
            </p>
          </form>

          <div className="auth-switch-line">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button type="button" onClick={() => changeMode("login")}>
                  Sign in
                </button>
              </>
            ) : mode === "forgot" ? (
              <>
                Remembered your password?{" "}
                <button type="button" onClick={() => changeMode("login")}>
                  Back to sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => changeMode("signup")}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </section>
      </section>

      <footer className="auth-footer">
        <span>© 2026 PAPERLY AI</span>
        <span>Your world. Your daily paper.</span>
        <Link href="/">Back to Paperly</Link>
      </footer>
    </main>
  );
}
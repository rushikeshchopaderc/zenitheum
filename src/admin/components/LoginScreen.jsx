import { useState } from "react";

import { api } from "../api";
import { useDocumentTitle } from "../hooks/useMisc";
import { Notice } from "./Feedback";
import Icon from "./icons";

/** Staff sign-in. `notice` explains why we are here ("session expired", "signed out"). */
export default function LoginScreen({ notice, noticeTone = "info", onSignedIn }) {
  useDocumentTitle("Sign in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await api.login(email.trim(), password);
      onSignedIn(response.admin);
    } catch (failure) {
      setError(failure.message || "Sign-in failed. Try again.");
      setBusy(false);
    }
  };

  return (
    <main className="adm-login">
      <div className="adm-login__card adm-card">
        <div className="adm-login__brand">
          <span className="adm-brand__mark" aria-hidden="true">
            Z
          </span>
          <span>
            <span className="adm-brand__name">Zenitheum</span>
            <span className="adm-brand__tag">Admin console</span>
          </span>
        </div>
        <h1 className="adm-h1" style={{ fontSize: 24 }}>
          Sign in
        </h1>
        <p className="adm-lede" style={{ marginTop: -6 }}>
          For Zenitheum staff. Leads, applications and website activity are inside.
        </p>

        {notice ? (
          <Notice tone={noticeTone} icon={noticeTone === "warn" ? "lock" : "info"}>
            {notice}
          </Notice>
        ) : null}

        <form onSubmit={submit} className="adm-login__form" noValidate>
          <div className="adm-field">
            <label className="adm-label" htmlFor="adm-email">
              Email address
            </label>
            <input
              id="adm-email"
              className="adm-input"
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "adm-login-error" : undefined}
              required
            />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="adm-password">
              Password
            </label>
            <div className="adm-passwrap">
              <input
                id="adm-password"
                className="adm-input"
                type={show ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? "adm-login-error" : undefined}
                required
              />
              <button type="button" className="adm-iconbtn adm-iconbtn--sm adm-passwrap__toggle" onClick={() => setShow((value) => !value)} aria-pressed={show} aria-label="Show password">
                <Icon name={show ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
          </div>

          <div id="adm-login-error" role="alert" aria-live="assertive">
            {error ? <div className="adm-banner"><Icon name="alert" size={18} /><div className="adm-banner__text">{error}</div></div> : null}
          </div>

          <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
            {busy ? <Icon name="spinner" size={16} className="adm-spin" /> : <Icon name="lock" size={16} />}
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

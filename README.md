# Portfolio (Firebase edition)

Fully static site, everything lives at the repo root. All data lives in Firestore, admin login is
Firebase Auth. No server, no port forwarding, no tablet required.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it
   anything (e.g. `aneesh-portfolio`) → skip Google Analytics if you don't
   want it.

## 2. Enable Firestore

1. In the left sidebar: **Build → Firestore Database → Create database**.
2. Start in **production mode** (the rules file in this repo already locks
   it down correctly).
3. Pick any region close to you.

## 3. Enable Email/Password sign-in (this is your admin password)

1. **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. Go to the **Users** tab → **Add user** → enter the email + password
   you'll log into `/admin.html` with. This is the only account that will
   ever exist, so it's effectively your admin password.

## 4. Get your web app config

1. Project overview (gear icon) → **Project settings** → scroll to
   **Your apps** → click the **</>** (web) icon → register an app (nickname
   doesn't matter, skip hosting setup here, we'll do it via CLI).
2. Copy the `firebaseConfig` object it shows you.
3. Paste those values into `js/firebase-config.js`, replacing the
   placeholders.

## 5. Deploy the Firestore rules

You need the Firebase CLI once for this (and for hosting deploys):
```
npm install -g firebase-tools
firebase login
```
From this project's root folder:
```
firebase use --add
```
Pick the project you just created. Then:
```
firebase deploy --only firestore:rules
```

## 6. Load your real content

1. Deploy the site once (step 7 below), or just open `admin.html`
   locally with a simple static server:
   ```
   npx serve .
   ```
2. Log in with the email/password from step 3.
3. Click **Load starter data** once. This fills in your real projects,
   experience entries, and the popup text, so you don't have to retype
   everything.
4. From then on, add/edit/delete anything through the same dashboard.

## 7. Deploy to Firebase Hosting (free, HTTPS included)

```
firebase deploy --only hosting
```
It'll print a URL like `https://your-project.web.app` — that's your live
site, real HTTPS cert included automatically, no Caddy or port forwarding
needed. You can also attach a custom domain for free under
**Hosting → Add custom domain** in the console.

## 8. (Optional) Also host via GitHub Pages

Since everything sits at the repo root, this works with zero extra setup:
1. Push this folder to a GitHub repo.
2. Repo → **Settings → Pages** → Branch: `main`, Folder: **`/ (root)`** → Save.
3. GitHub gives you a `https://yourusername.github.io/your-repo-name/` URL.

No build step, no npm required — GitHub Pages just serves the static files
directly.

## Notes

- `js/firebase-config.js` is meant to be public. It's not a secret,
  it just tells the browser which Firebase project to talk to. Actual
  write protection comes from `firestore.rules` (only your logged-in
  account can write) plus Firebase Auth (only your one account exists).
- Want a second admin login later? Add another user under
  **Authentication → Users** in the console. No code changes needed.
- If you ever want to reset your password, do it from the Authentication
  tab in the console, not by editing anything in this repo.

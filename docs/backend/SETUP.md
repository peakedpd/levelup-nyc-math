# LevelUp teacher platform — backend setup (decision needed from John)

**What works today with no account:** every device keeps its own progress (`localStorage`), and the Teacher Hub
collects students by **progress codes / files** (`LUP-…`), shares the class by **class code** (`LUC-…`) and sends
missions by **assignment code** (`LUA-…`). Students who share one device appear automatically. All codes carry a
checksum, so a mistyped code is rejected instead of corrupting data, and merging never loses answers from either device.

**What a backend adds:** real accounts, automatic cross-device sync, the teacher seeing the whole class live, and
assignments arriving without codes. The client is already built for it (`src_learn/classroom.js` →
`ADAPTERS.supabase`, verified against a mock server in `tools/verify_classroom.js`); it switches on as soon as a
project URL + anon key are pasted into **Teacher Hub → Sync & accounts**.

## Recommended: Supabase (free tier)
Why: Postgres + Row Level Security keeps each student's data private to them and their teacher; anonymous sign-in
means **no student emails or passwords** (good for under-13s); free tier (500 MB DB, 50k monthly active users) is far
more than a school needs. Firebase would also work, but RLS-style rules on relational class/student data are simpler here.

### What John needs to do (≈10 minutes, one time)
1. **Sign up** at <https://supabase.com> (GitHub or email login) → **New project** (free plan). Pick a region near NYC
   (e.g. `us-east-1`), set a database password and keep it private.
2. **SQL Editor → New query** → paste [`schema.sql`](schema.sql) → **Run**.
3. **Authentication → Sign In / Providers**: turn on **Anonymous sign-ins** (students) and keep **Email** on
   (teacher magic link). Under **URL Configuration**, set Site URL to `https://peakedpd.github.io/levelup-nyc-math/`.
4. **Project Settings → API**: copy the **Project URL** (`https://xxxx.supabase.co`) and the **anon public** key.
   (The anon key is designed to be public; RLS protects the data. **Never** paste the `service_role` key anywhere.)
5. In the game: **Teacher view → Teacher Hub → Sync & accounts** → paste both → **Save**. Re-share the class code;
   it now carries the backend so students' devices connect automatically.
6. Tell Grok Bot it's done — the remaining wiring to test end-to-end against the real project (teacher magic-link sign-in
   flow in the Hub, creating the `classes` row, a live two-device sync test) takes one short session.

### Privacy checklist (for the school)
- Students: nickname only (≤16 chars), no email, no birthday, no photo. Teacher: school email.
- Data: answers, levels, misconception tags, minutes — no free-text personal info except "Explain It" answers.
- A teacher can delete a student (cascade removes their progress). Supabase offers a DPA for FERPA/COPPA reviews.

### Cost
$0 on the free plan. Free projects pause after 1 week with no activity (one click to resume); the $25/mo Pro plan
removes that if the whole school uses it.

## Alternative: Firebase (Spark free plan)
Same adapter interface (`push`, `pull`, `pullClass`, `pushAssignment`, `pullAssignments`); would need a
`firebase` adapter (~80 lines) + Firestore security rules. Choose this only if the school is already on Google Cloud.

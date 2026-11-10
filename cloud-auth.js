(function () {
  const $ = (id) => document.getElementById(id);
  const gate = $("authGate");
  const app = document.querySelector(".app");
  const message = $("authMessage");
  let isSignUp = false;
  let client, currentUser, saveTimer, saving = false, remoteChannel, lastCloudFingerprint = "";
  const TABLE = "newme_app_state";
  const CACHE_KEY = "newme_data";
  const say = (text, good = false) => { message.textContent = text; message.style.color = good ? "#28794d" : "#9c4262"; };
  const stableStringify = (value) => {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
    return JSON.stringify(value);
  };

  if (!window.supabase?.createClient || !window.DUOBLOOM_SUPABASE_URL || !window.DUOBLOOM_SUPABASE_PUBLISHABLE_KEY) {
    say("Supabase client configuration is missing. Check supabase-config.js.");
    return;
  }
  client = window.supabase.createClient(window.DUOBLOOM_SUPABASE_URL, window.DUOBLOOM_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.duobloomSupabase = client;

  $("toggleAuthMode").addEventListener("click", () => {
    isSignUp = !isSignUp;
    $("authSubmit").textContent = isSignUp ? "Create shared account" : "Sign in";
    $("toggleAuthMode").textContent = isSignUp ? "I already have an account — sign in" : "Create the shared account";
    $("authPassword").autocomplete = isSignUp ? "new-password" : "current-password";
    say(isSignUp ? "Create one account, then use the same email and password on both devices." : "");
  });

  $("authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    $("authSubmit").disabled = true;
    say(isSignUp ? "Creating shared account…" : "Signing in…");
    try {
      const result = isSignUp
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}${location.pathname}` } })
        : await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (isSignUp && !result.data.session) {
        say("Account created. Check your email to confirm it, then return here and sign in.", true);
        return;
      }
      if (result.data.user) await openApp(result.data.user);
    } catch (error) {
      say(error.message || "Authentication failed.");
    } finally {
      $("authSubmit").disabled = false;
    }
  });

  async function openApp(user) {
    currentUser = user;
    say("Loading your shared DuoBloom data…");
    const { data, error } = await client.from(TABLE).select("app_state,updated_at").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    let initial;
    if (data?.app_state && typeof data.app_state === "object") {
      initial = data.app_state;
    } else {
      initial = {
        settings: {}, entries: { her: {}, him: {} },
        pets: { her: { breedMonth: "", coins: 0, owned: [], equipped: [] }, him: { breedMonth: "", coins: 0, owned: [], equipped: [] } },
        awards: { her: [], him: [] }, milestones: [], punDone: {}, _emptyByChoice: true
      };
      const { error: insertError } = await client.from(TABLE).upsert({ user_id: user.id, app_state: initial, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (insertError) throw insertError;
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(initial));
    lastCloudFingerprint = stableStringify(initial);
    gate.style.display = "none";
    app.style.display = "block";
    const status = $("cloudSyncStatus");
    if (status) status.textContent = `Signed in as ${user.email}. Cloud sync is active.`;
    await loadAppScripts();
    subscribeToChanges();
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.body.appendChild(script);
    });
  }
  async function loadAppScripts() {
    try {
      await loadScript("app.js");
      await loadScript("v7.js");
      await loadScript("gym.js");
      await loadScript("awards.js");
    } catch (error) {
      console.error(error);
      const status = $("cloudSyncStatus");
      if (status) status.textContent = "App files could not load. Refresh and try again.";
    }
  }

  window.persistNewMeState = function (state, options = {}) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
    lastCloudFingerprint = stableStringify(state);
    if (!currentUser) return Promise.resolve();
    clearTimeout(saveTimer);
    const write = async () => {
      saving = true;
      const status = $("cloudSyncStatus");
      if (status) status.textContent = "Saving to DuoBloom cloud…";
      try {
        const { error } = await client.from(TABLE).upsert({
          user_id: currentUser.id,
          app_state: state,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" });
        if (error) throw error;
        if (status) status.textContent = `Cloud synced · ${new Date().toLocaleTimeString()}`;
      } catch (error) {
        console.error("DuoBloom cloud save failed:", error);
        if (status) status.textContent = `Cloud save failed: ${error.message}. Latest changes remain cached on this device until sync succeeds.`;
      } finally {
        saving = false;
      }
    };
    if (options.immediate) return write();
    saveTimer = setTimeout(write, 450);
    return Promise.resolve();
  };

  function subscribeToChanges() {
    remoteChannel = client.channel("duobloom-shared-state")
      .on("postgres_changes", { event: "*", schema: "public", table: TABLE, filter: `user_id=eq.${currentUser.id}` }, (payload) => {
        if (saving || saveTimer || !payload.new?.app_state) return;
        const fingerprint = stableStringify(payload.new.app_state);
        if (fingerprint === lastCloudFingerprint) return;
        const remote = JSON.stringify(payload.new.app_state);
        localStorage.setItem(CACHE_KEY, remote);
        location.reload();
      })
      .subscribe((status) => {
        const el = $("cloudSyncStatus");
        if (el && status === "SUBSCRIBED") el.textContent = `Signed in as ${currentUser.email} · Live cloud sync connected.`;
        if (el && status === "CHANNEL_ERROR") el.textContent = "Cloud sync is saved, but live updates could not connect. Refresh to fetch the latest data.";
      });
  }

  $("signOutBtn")?.addEventListener("click", async () => {
    if (!confirm("Sign out of DuoBloom on this device? Your cloud data will remain saved.")) return;
    if (remoteChannel) await client.removeChannel(remoteChannel);
    await client.auth.signOut();
    localStorage.removeItem(CACHE_KEY);
    location.reload();
  });

  client.auth.getSession().then(async ({ data, error }) => {
    if (error) { say(error.message); return; }
    if (data.session?.user) {
      try { await openApp(data.session.user); }
      catch (err) { say(`Could not load cloud data: ${err.message}. Run the SQL setup and refresh.`); }
    }
  }).catch((error) => say(error.message));
})();

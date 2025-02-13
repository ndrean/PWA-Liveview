import "../css/app.css";
// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html";

const CONFIG = {
    ROUTES: Object.freeze(["/", "/map"]),
    POLL_INTERVAL: 5000,
    CACHE_NAME: "lv-pages",
  },
  appState = {
    paths: new Set(),
    connection: {
      status: "checking", // 'checking'|'online'|'offline'
      lastSeen: null,
      retries: 0,
    },
    sw: {
      registered: false,
      controlling: false,
    },
    // isOnline: false,
    // interval: null,
  };

async function addCurrentPageToCache({ current, routes }) {
  await navigator.serviceWorker.ready;
  const newPath = new URL(current).pathname;

  if (!routes.includes(newPath)) return;
  // we cache the two pages "/"" and "/map" only once.
  if (appState.paths.has(newPath)) return;

  if (newPath === window.location.pathname) {
    appState.paths.add(newPath);
    const htmlContent = document.documentElement.outerHTML;
    const contentLength = new TextEncoder().encode(htmlContent).length;
    const headers = new Headers({
      "Content-Type": "text/html",
      "Content-Length": contentLength,
    });

    const response = new Response(htmlContent, {
      headers: headers,
      status: 200,
      statusText: "OK",
    });

    const cache = await caches.open(CONFIG.CACHE_NAME);
    return cache.put(current, response);
  } else return;
}

async function safeImport(modulePath) {
  try {
    return await import(modulePath);
  } catch (error) {
    console.error(`Module ${modulePath} load failed:`, error);
    return { default: () => document.write("Offline content unavailable") };
  }
}

// Monitor navigation events and cache the current page if in declared routes
navigation.addEventListener("navigate", async ({ destination: { url } }) => {
  return addCurrentPageToCache({ current: url, routes: CONFIG.ROUTES });
});

//---------------
// Check server reachability
async function checkServer() {
  try {
    const response = await fetch("/connectivity", { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error("Error checking server reachability:", error);
    return false;
  }
}

function updateConnectionStatusUI(status) {
  const statusElement = document.getElementById("online-status");
  if (!statusElement) return;

  // Set dataset attributes for styling
  statusElement.dataset.connectionStatus = status;
  statusElement.dataset.lastSeen = appState.lastSeen || "Never";

  // Update image source and styling
  statusElement.src =
    status === "online" ? "/images/online.svg" : "/images/offline.svg";

  // Add/remove classes for visual feedback
  statusElement.classList.toggle("pulse", status === "checking");
  statusElement.classList.toggle("grayscale", status === "offline");

  // Update tooltip for better UX
  statusElement.title = `${status.toUpperCase()} - Last seen: ${new Date(
    appState.lastSeen
  ).toLocaleString()}`;
}

// CSS suggestions:
/*
[data-connection-status="online"] {
  filter: hue-rotate(120deg);
  animation: pulse-online 2s infinite;
}

[data-connection-status="offline"] {
  filter: grayscale(1);
  animation: shake 0.5s ease-in-out;
}

@keyframes pulse-online {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
*/

// function updateOnlineStatusUI(online) {
//   const statusElement = document.getElementById("online-status");
//   if (!statusElement) return;

//   if (statusElement) {
//     statusElement.style.backgroundColor = online ? "lavender" : "tomato";
//     statusElement.style.opacity = online ? "0.8" : "1";
//     statusElement.textContent = online ? "Online" : "Offline";
//   }
// }

function startPolling(baseInterval = CONFIG.POLL_INTERVAL) {
  clearInterval(appState.interval);
  const interval = baseInterval * Math.pow(2, appState.connection.retries);
  appState.interval = setInterval(async () => {
    const wasOnline = appState.connection.status === "online";
    // const wasOnline = appState.isOnline;
    appState.isOnline = await checkServer();
    if (appState.isOnline !== wasOnline) {
      window.location.reload();
    }
    appState.connection.retries = Math.min(appState.connection.retries + 1, 5);
  }, interval);
  console.log("Started polling...");
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing status monitoring...");
  // appState.isOnline = await checkServer() ? 'online' : 'offline'
  // updateOnlineStatusUI(appState.isOnline);
  const initialStatus = (await checkServer()) ? "online" : "offline";
  appState.connection.status = initialStatus;
  appState.connection.lastSeen = Date.now();
  updateConnectionStatusUI(initialStatus);

  // Start polling only if offline
  if (!appState.connection.status === "online") {
    startPolling();
  }

  // Monitor online and offline events
  window.addEventListener("online", async () => window.location.reload());

  window.addEventListener("offline", () => {
    appState.isOnline = false;
    updateOnlineStatusUI(appState.isOnline);
    startPolling(); // Start polling when offline
  });
});

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none",
        scope: "/",
      });

      registration.addEventListener("updatefound", handleSWUpdate);
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange
      );

      appState.sw.registered = true;
    } catch (error) {
      console.error("SW registration failed:", error);
    }
  }
}

//--------------
async function initApp(lineStatus) {
  try {
    const { default: initYdoc } = await import("./initYJS.js");
    const ydoc = await initYdoc();
    const { solHook } = await import("./solHook.js"),
      { MapVHook } = await import("./mapVHook.js"),
      { FormVHook } = await import("./formVHook.js"),
      { configureTopbar } = await import("./configureTopbar.js"),
      { PwaHook } = await import("./pwaHook.js"),
      SolHook = solHook(ydoc);

    configureTopbar();

    // Online mode
    if (lineStatus) {
      return initLiveSocket({ SolHook, MapVHook, FormVHook, PwaHook });
    }

    // Offline mode
    const path = window.location.pathname;

    if (path === "/map") {
      displayVMap();
      displayVForm();
    } else if (path === "/") {
      displayStock(ydoc);
    }
  } catch (error) {
    console.error("Init failed:", error);
  }
}

async function initLiveSocket(hooks) {
  const { LiveSocket } = await import("phoenix_live_view");
  const { Socket } = await import("phoenix");
  const csrfToken = document
    .querySelector("meta[name='csrf-token']")
    .getAttribute("content");

  const liveSocket = new LiveSocket("/live", Socket, {
    longPollFallbackMs: 2000,
    params: { _csrf_token: csrfToken },
    hooks,
  });

  liveSocket.connect();
  window.liveSocket = liveSocket;

  liveSocket.getSocket().onOpen(() => {
    console.log("liveSocket connected", liveSocket?.socket.isConnected());
  });
}

async function displayVMap() {
  console.log("Render Map-----");
  const { RenderVMap } = await import("./renderVMap.js");
  return RenderVMap();
}
async function displayVForm() {
  console.log("Render Form-----");
  const { RenderVForm } = await import("./renderVForm.js");
  return RenderVForm();
}

async function displayStock(ydoc) {
  console.log("Render Stock-----");
  const { SolidComp } = await import("./SolidComp.jsx");

  return SolidComp({
    ydoc,
    userID: sessionStorage.getItem("userID"),
    max: sessionStorage.getItem("max"),
    el: document.getElementById("solid"),
  });
}

// **************************************
(async () => {
  appState.isOnline = await checkServer();
  await initApp(appState.isOnline);

  if ("serviceWorker" in navigator && appState.isOnline) {
    await addCurrentPageToCache({
      current: window.location.href,
      routes: CONFIG.ROUTES,
    });
  }
})();

//--------------
// Show progress bar on live navigation and form submits

// Enable server log streaming to client. Disable with reloader.disableServerLogs()
window.addEventListener("phx:live_reload:attached", ({ detail: reloader }) => {
  reloader.enableServerLogs();
  window.liveReloader = reloader;
});

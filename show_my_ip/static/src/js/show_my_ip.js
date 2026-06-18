/** @odoo-module **/
/**
 * Show My IP – client-side enrichment
 *
 * Responsibilities:
 *  1. Fetch public IPv4 (api.ipify.org) and IPv6 (api64.ipify.org).
 *  2. Fetch location / ISP data (ipapi.co) – one HTTPS call, no API key required.
 *  3. Enrich browser / OS display from navigator.userAgent.
 *
 * Works both on the standalone page (#show_my_ip_page) and on the
 * embeddable website snippet (.show_my_ip_snippet).
 */

import publicWidget from "@web/legacy/js/public/public_widget";

// ---------------------------------------------------------------------------
// Helper: update a DOM element inside the widget root
// ---------------------------------------------------------------------------
function setEl(root, id, html, asText = false) {
    const el = root.querySelector(`#${id}`);
    if (!el) return;
    el.classList.remove("smi-loading");
    if (asText) {
        el.textContent = html;
    } else {
        el.innerHTML = html;
    }
}

// ---------------------------------------------------------------------------
// Browser / OS detection from User-Agent string
// ---------------------------------------------------------------------------
function parseBrowser(ua) {
    // Browser name + version
    const browsers = [
        [/Edg\/(\S+)/, "Edge"],
        [/OPR\/(\S+)/, "Opera"],
        [/Chrome\/(\S+)/, "Chrome"],
        [/Firefox\/(\S+)/, "Firefox"],
        [/Safari\/(\S+)/, "Safari"],
        [/MSIE\s(\S+)/, "Internet Explorer"],
        [/Trident\/.*rv:(\S+)/, "Internet Explorer"],
    ];
    for (const [re, name] of browsers) {
        const m = ua.match(re);
        if (m) return { name, version: m[1] };
    }
    return { name: "Unknown", version: "" };
}

function parseOS(ua) {
    const systems = [
        [/Windows NT 10.0/, "Windows 10/11"],
        [/Windows NT 6.3/, "Windows 8.1"],
        [/Windows NT 6.2/, "Windows 8"],
        [/Windows NT 6.1/, "Windows 7"],
        [/Windows/, "Windows"],
        [/iPhone OS ([\d_]+)/, "iOS"],
        [/iPad.*OS ([\d_]+)/, "iPadOS"],
        [/Android ([\d.]+)/, "Android"],
        [/Mac OS X ([\d_]+)/, "macOS"],
        [/Linux/, "Linux"],
        [/CrOS/, "ChromeOS"],
    ];
    for (const [re, name] of systems) {
        const m = ua.match(re);
        if (m) {
            const version = m[1] ? m[1].replace(/_/g, ".") : "";
            return version ? `${name} ${version}` : name;
        }
    }
    return "Unknown";
}

// ---------------------------------------------------------------------------
// Location HTML builder
// ---------------------------------------------------------------------------
function buildLocationHTML(d) {
    const items = [
        ["fa-flag", "Country", escHtml(`${d.country_name} (${d.country_code})`)],
        ["fa-city", "City", escHtml(`${d.city}, ${d.region}`)],
        ["fa-map-pin", "Postal", escHtml(d.postal)],
        ["fa-clock", "Timezone", escHtml(d.timezone)],
        ["fa-building", "ISP", escHtml(d.org)],
        ["fa-map", "Coordinates", escHtml(`${d.latitude}, ${d.longitude}`)],
    ].filter(([, , v]) => v && v !== "undefined" && v !== ", ");

    return `<div class="smi-location-grid">
        ${items
            .map(
                ([icon, label, value]) => `
        <div class="smi-loc-item">
            <span class="smi-loc-label"><i class="fa ${escHtml(icon)} me-1"></i>${escHtml(label)}</span>
            <span class="smi-loc-value">${value}</span>
        </div>`
            )
            .join("")}
    </div>`;
}

function escHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Public widget
// ---------------------------------------------------------------------------
publicWidget.registry.ShowMyIP = publicWidget.Widget.extend({
    selector: "#show_my_ip_page",

    async start() {
        await this._super(...arguments);
        // Run enrichments in parallel; failures in one must not block others
        await Promise.allSettled([
            this._loadBrowserInfo(),
            this._loadIPv4(),
            this._loadIPv6(),
            this._loadLocation(),
        ]);
    },

    // -------- Browser info --------
    _loadBrowserInfo() {
        const ua = navigator.userAgent;

        // Always display the raw User-Agent string
        setEl(this.el, "smi_ua", ua, true);

        // Client-side detection is more accurate for modern user agents
        const { name, version } = parseBrowser(ua);
        const os = parseOS(ua);

        const browserEl = this.el.querySelector("#smi_browser");
        if (browserEl) {
            const text = version ? `${name} ${version}` : name;
            // Only replace if the server didn't already fill a non-empty value
            if (!browserEl.textContent.trim() || browserEl.classList.contains("smi-loading")) {
                setEl(this.el, "smi_browser", escHtml(text), true);
            } else {
                setEl(this.el, "smi_browser", escHtml(browserEl.textContent.trim()), true);
            }
        }

        setEl(this.el, "smi_os", escHtml(os), true);
        return Promise.resolve();
    },

    // -------- IPv4 --------
    async _loadIPv4() {
        try {
            const resp = await fetch("https://api.ipify.org?format=json");
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setEl(this.el, "smi_ipv4", escHtml(data.ip), true);
        } catch {
            setEl(this.el, "smi_ipv4", "Not available", true);
        }
    },

    // -------- IPv6 (api64 prefers IPv6 but falls back to IPv4) --------
    async _loadIPv6() {
        try {
            const resp = await fetch("https://api64.ipify.org?format=json");
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            // Only show if it looks like a real IPv6 address
            const ip = data.ip || "";
            setEl(this.el, "smi_ipv6", escHtml(ip.includes(":") ? ip : "Not available"), true);
        } catch {
            setEl(this.el, "smi_ipv6", "Not available", true);
        }
    },

    // -------- Location via ipapi.co (free, HTTPS, no key needed) --------
    async _loadLocation() {
        try {
            const resp = await fetch("https://ipapi.co/json/");
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (data.error) throw new Error(data.reason || "API error");
            setEl(this.el, "smi_location", buildLocationHTML(data));
        } catch {
            setEl(this.el, "smi_location", "Location not available", true);
        }
    },
});

export default publicWidget.registry.ShowMyIP;

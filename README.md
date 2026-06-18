# ShowMyIP

> Webseite, die die eigene öffentliche IPv4/v6 anzeigt, Browser und Standort. Zur Einbindung in die Odoo-Webseite. Für Odoo 19.

An **Odoo 19 module** that shows a visitor their:

| Information | Source |
|-------------|--------|
| Public **IPv4** address | [ipify.org](https://www.ipify.org/) (client-side) |
| Public **IPv6** address | [ipify.org](https://www.ipify.org/) (client-side) |
| **Browser** name & version | `navigator.userAgent` / server-side werkzeug |
| **Operating System** | `navigator.userAgent` |
| Geographic **location** (country, city, timezone, ISP, coordinates) | [ipapi.co](https://ipapi.co/) (client-side, free, no API key) |

## Features

* **Standalone page** at `/show-my-ip` — ready to link from your Odoo menu.
* **Website builder snippet** — drag the *Show My IP* block onto any page in the Odoo website editor.
* Fully responsive; uses Bootstrap 5 (already bundled by Odoo).
* No external API keys required; no data is stored.

## Requirements

* **Odoo 19** (Community or Enterprise)
* The `website` module must be installed.

## Installation

1. Copy (or clone) the `show_my_ip` folder into your Odoo **addons path**.
2. Restart the Odoo server.
3. In Odoo: *Settings → Apps → Update Apps List*, then search for **Show My IP** and click **Install**.

```bash
# Example – assuming /opt/odoo/addons is in your addons_path
cp -r show_my_ip /opt/odoo/addons/
# Restart Odoo, then install via UI
```

## Usage

### Standalone page

Navigate to `https://<your-odoo-domain>/show-my-ip`.  
You can add a menu item pointing to this URL under *Website → Pages → New Menu Item*.

### Website builder snippet

1. Open the **Odoo Website** editor on any page.
2. In the snippet panel on the left, find the **Show My IP** section.
3. Drag the block onto your page and save.

### Embedding via `<iframe>`

If you prefer to embed the page in a non-Odoo context or as an iframe snippet:

```html
<iframe src="https://<your-odoo-domain>/show-my-ip"
        width="100%" height="600" frameborder="0"
        style="border-radius:8px; border:1px solid #dee2e6;">
</iframe>
```

## Architecture

```
show_my_ip/
├── __init__.py
├── __manifest__.py
├── controllers/
│   ├── __init__.py
│   └── main.py               ← HTTP route /show-my-ip, server-side IP & UA detection
├── views/
│   └── templates.xml         ← QWeb: standalone page + snippet + builder registration
└── static/
    ├── description/
    │   └── snippet_thumbnail.svg
    └── src/
        ├── css/show_my_ip.css
        └── js/show_my_ip.js  ← public widget: IPv4/IPv6, location, browser enrichment
```

## Privacy

* No visitor data is stored by this module.
* IP address and location lookups are performed **in the visitor's browser** using the free public APIs of [ipify.org](https://www.ipify.org/) and [ipapi.co](https://ipapi.co/).
* The server-side component only reads the IP from standard HTTP request headers to pre-fill the page before JavaScript runs.

## License

Released into the public domain – see [LICENSE](LICENSE).


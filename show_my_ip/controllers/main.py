from odoo import http
from odoo.http import request


class ShowMyIPController(http.Controller):
    """Serve the Show My IP page and detect visitor information server-side."""

    @http.route('/show-my-ip', type='http', auth='public', website=True, sitemap=True)
    def show_my_ip(self, **kwargs):
        """Render the main Show My IP page."""
        ip_address = self._get_client_ip()
        browser, browser_version, platform = self._get_browser_info()

        return request.render('show_my_ip.page', {
            'ip_address': ip_address,
            'browser': browser,
            'browser_version': browser_version,
            'platform': platform,
        })

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _get_client_ip(self):
        """Return the client IP from Werkzeug's normalized proxy-aware request data."""
        for value in request.httprequest.access_route or ():
            value = value.strip()
            if value:
                return value
        return (request.httprequest.remote_addr or '').strip()

    def _get_browser_info(self):
        """Return (browser, version, platform) from the werkzeug User-Agent object."""
        ua = request.httprequest.user_agent
        try:
            browser = ua.browser or ''
            version = ua.version or ''
            platform = ua.platform or ''
        except Exception:
            browser = version = platform = ''
        return browser, version, platform

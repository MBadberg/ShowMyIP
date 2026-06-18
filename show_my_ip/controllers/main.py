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
        """Return the real client IP, respecting common proxy headers."""
        env = request.httprequest.environ
        for header in ('HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'):
            value = env.get(header, '').strip()
            if value:
                # X-Forwarded-For may contain a comma-separated list; use the first entry
                return value.split(',')[0].strip()
        return ''

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

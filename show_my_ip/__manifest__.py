{
    'name': 'Show My IP',
    'version': '19.0.1.0.0',
    'summary': 'Displays your public IPv4/IPv6 address, browser info and location',
    'description': '''
Show My IP
==========

A website page and embeddable snippet that displays:

* Public **IPv4** and **IPv6** addresses (via ipify.org)
* Browser name, version and operating system
* Geographic location, timezone and ISP (via ipapi.co)

**Standalone page**: ``/show-my-ip``

**Website builder snippet**: drag the *Show My IP* block onto any page.
    ''',
    'category': 'Website',
    'author': 'MBadberg',
    'website': 'https://github.com/MBadberg/ShowMyIP',
    'license': 'Other OSI approved licence',
    'depends': ['website'],
    'data': [
        'views/templates.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'show_my_ip/static/src/css/show_my_ip.css',
            'show_my_ip/static/src/js/show_my_ip.js',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'images': ['static/description/banner.png'],
}

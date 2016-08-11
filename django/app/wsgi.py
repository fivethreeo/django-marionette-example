"""
WSGI config for app project.

It exposes the WSGI callable as a module-level variable 
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

application = get_wsgi_application()

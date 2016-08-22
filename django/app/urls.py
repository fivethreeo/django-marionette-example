from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import *
from django.views.generic import TemplateView

from tastypie.api import Api
from app.api import UserResource, CreateUserResource, UserProfileResource

v1_api = Api(api_name='v1')
v1_api.register(CreateUserResource())
v1_api.register(UserResource())
v1_api.register(UserProfileResource())

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(template_name="index.html")),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(v1_api.urls))
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
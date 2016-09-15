from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.conf.urls import patterns, url, include
from rest_framework.routers import DefaultRouter

from . import api
router = DefaultRouter()
router.register(r'users', api.UserViewSet)
 
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^rest-auth/', include('rest_auth.urls')),
    url(r'^rest-auth/registration/', include('rest_auth.registration.urls')),
    url(r'^api/removeuser/', api.UserDetailsView.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + patterns('',
	url(r'.*', TemplateView.as_view(template_name="index.html")))
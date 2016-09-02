from django.contrib.auth.models import User
from rest_auth.app_settings import UserDetailsSerializer
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework import viewsets, filters, permissions
from app.permissions import ViewObjectPermissions
from app.serializers import PermissionListSerializer, ResultsDictPageNumberPagination

from django.contrib.auth.backends import ModelBackend 

try:
    from guardian.core import ObjectPermissionChecker
except ImportError:
    pass

class PermissionDetailsSerializer(UserDetailsSerializer):

    # use the PermissionDetailsSerialiser from app.serializers when not subclassing UserDetailsSerializer

    _permission_checker = None
    _model_permissions = []
    with_object_permissions = False

    def _get_user(self):
        return self._context['view'].request.user

    def _get_permission_checker(self):
        if not self._permission_checker:
            self._permission_checker = ObjectPermissionChecker(self._get_user())
        return self._permission_checker

    def _prefetch_permissions(self, objects):
        self._get_permission_checker().prefetch_perms(objects)

    def permissions(self, objects):
        backend = ModelBackend()
        perms = backend.get_all_permissions(self._get_user())
        opts = self.Meta.model._meta
        start = opts.app_label+'.'
        end = '_'+opts.model_name
        self._model_permissions = [x[len(start):] for x in perms if x.startswith(start) and x.endswith(end)]
        if self.with_object_permissions:
            self._prefetch_permissions(objects)
        return self._model_permissions

    def object_permissions(self, obj):
        perms = self._model_permissions
        if self.with_object_permissions:
            perms = set(perms + self._get_permission_checker().get_perms(obj))
        return perms

    def to_representation(self, data):
        rep = super(UserDetailsSerializer, self).to_representation(data)
        rep['_permissions'] = self.object_permissions(data)
        return rep

    class Meta(UserDetailsSerializer.Meta):
        list_serializer_class = PermissionListSerializer

class UserDetailsView(RetrieveUpdateDestroyAPIView):
    """
    Returns User's details in JSON format.
    Accepts the following GET parameters: token
    Accepts the following POST parameters:
        Required: token
        Optional: email, first_name, last_name and UserProfile fields
    Returns the updated UserProfile and/or User object.
    """
    serializer_class = UserDetailsSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class UserViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing the accounts
    associated with the user.
    """
    serializer_class = PermissionDetailsSerializer
    queryset = User.objects.all()
    pagination_class = ResultsDictPageNumberPagination

    #filter_backends = (filters.DjangoObjectPermissionsFilter,)
    #permission_classes = (ViewObjectPermissions,)
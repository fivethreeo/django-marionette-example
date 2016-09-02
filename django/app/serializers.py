from django.db import models
from django.contrib.auth.backends import ModelBackend 
from rest_framework import serializers
from rest_framework.utils.serializer_helpers import ReturnDict
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

try:
    from guardian.core import ObjectPermissionChecker
except ImportError:
    pass


class ResultsDictPageNumberPagination(PageNumberPagination):
    
    def get_paginated_response(self, data):
        data = super(ResultsDictPageNumberPagination, self).get_paginated_response(data).data
        if 'results' in data['results']:
            data.update(data['results'])
        return Response(data)

class PermissionListSerializer(serializers.ListSerializer):

    def to_representation(self, data):
        """
        List of object instances -> List of dicts of primitive datatypes.
        """
        # Dealing with nested relationships, data can be a Manager,
        # so, first get a queryset from the Manager if needed
        iterable = data.all() if isinstance(data, models.Manager) else data
        return {'_permissions': self.child.permissions(iterable), 'results': [
            self.child.to_representation(item) for item in iterable
        ]}

    @property
    def data(self):
        ret = super(serializers.ListSerializer, self).data
        return ReturnDict(ret, serializer=self)

class PermissionDetailsSerializer(serializers.ModelSerializer):

    _permission_checker = None
    _model_permissions = []
    with_object_permissions = True

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

    class Meta:
        list_serializer_class = PermissionListSerializer
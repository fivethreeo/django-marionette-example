from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.backends import ModelBackend 

from rest_auth.app_settings import UserDetailsSerializer
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework import viewsets
from rest_framework import serializers
from rest_framework.utils.serializer_helpers import (
    BindingDict, BoundField, NestedBoundField, ReturnDict, ReturnList
)

from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated

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
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

class PermissionListSerializer(serializers.ListSerializer):

    def to_representation(self, data):
        """
        List of object instances -> List of dicts of primitive datatypes.
        """
        # Dealing with nested relationships, data can be a Manager,
        # so, first get a queryset from the Manager if needed
        iterable = data.all() if isinstance(data, models.Manager) else data
        backend = ModelBackend()
        permissions = backend.get_all_permissions(self._context['view'].request.user)
        return {'_permissions': permissions, 'results': [
            self.child.to_representation(item) for item in iterable
        ]}

    @property
    def data(self):
        ret = super(serializers.ListSerializer, self).data
        return ReturnDict(ret, serializer=self)

class CustomUserDetailsSerializer(UserDetailsSerializer):

    class Meta(UserDetailsSerializer.Meta):
        list_serializer_class = PermissionListSerializer

class ResultsDictPageNumberPagination(PageNumberPagination):
    
    def get_paginated_response(self, data):
        data = super(CustomPageNumberPagination, self).get_paginated_response(data).data
        if 'results' in data['results']:
            data.update(data['results'])
        return Response(data)

class UserViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing the accounts
    associated with the user.
    """
    serializer_class = CustomUserDetailsSerializer
    permission_classes = () #[IsAuthenticated]
    queryset = User.objects.all()
    pagination_class = ResultsDictPageNumberPagination
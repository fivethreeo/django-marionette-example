from django.contrib.auth.models import User
from rest_auth.app_settings import UserDetailsSerializer
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework import viewsets
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


class UserViewSet(viewsets.ModelViewSet):
    """
    A simple ViewSet for viewing and editing the accounts
    associated with the user.
    """
    authentication_classes = ()
    serializer_class = UserDetailsSerializer
    permission_classes = () #[IsAuthenticated]
    queryset = User.objects.all()
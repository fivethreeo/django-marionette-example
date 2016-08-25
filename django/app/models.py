from django.utils.translation import ugettext as _
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    A model to store extra information for each user.
    """
    user = models.OneToOneField(User, related_name='profile')
    picture = models.ImageField(_("picture"), upload_to='profile_pictures', null=True, blank=True)

    def __str__(self):
        return self.user.get_full_name()


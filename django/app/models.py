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


#===========================================================================
# SIGNALS
#===========================================================================
def signals_import():
    """ A note on signals.

    The signals need to be imported early on so that they get registered
    by the application. Putting the signals here makes sure of this since
    the models package gets imported on the application startup.
    """
    from tastypie.models import create_api_key

    models.signals.post_save.connect(create_api_key, sender=User)

signals_import()
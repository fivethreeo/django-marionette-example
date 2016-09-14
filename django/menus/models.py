from __future__ import unicode_literals

from django.db import models

class Restaurant(models.Model):
    name = models.CharField(max_length=30)
    telephone = models.CharField(max_length=8)

    def __unicode__(self):
        return self.name

class DishType(models.Model):
    name = models.CharField(max_length=30)

    def __unicode__(self):
        return self.name

class RestaurantDishType(models.Model):
    restaurant = models.ForeignKey(Restaurant)
    name = models.CharField(max_length=30)

    def __unicode__(self):
        return self.name
    
class Kitchen(models.Model):
    name = models.CharField(max_length=30)

    def __unicode__(self):
        return self.name

class Indgredient(models.Model):
    name = models.CharField(max_length=30, unique=True)
    approved = models.BooleanField(default=True)

    def __unicode__(self):
        return self.name

'''
from PIL  import Image
from pytesseract import image_to_string
open('test.txt', 'w').write(image_to_string(Image.open('test.jpg'), lang='nor'))
'''
import re 
indgredient_split = re.compile('[\s,]*')
indgredient_split2 = re.compile('\s?,\s?')

class Dish(models.Model):
    number = models.PositiveIntegerField()
    restaurant = models.ForeignKey(Restaurant)
    sopin_dishtype = models.ForeignKey(DishType)
    dishtype = models.ForeignKey(RestaurantDishType)
    kitchen = models.ForeignKey(Kitchen)
    name = models.CharField(max_length=60)
    indgredients = models.CharField(max_length=255)

    def save(self, **kwargs):
        self.indgredients = self.indgredients.lower()
        self.indgredients = ', '.join(indgredient_split2.split(self.indgredients))
        indgredients = set(indgredient_split.split(self.indgredients)+indgredient_split2.split(self.indgredients))
        indgredients_existing = set(Indgredient.objects.filter(
            name__in=indgredients).values_list('name', flat=True))
        for indgredient in indgredients - indgredients_existing:
            Indgredient(name=indgredient, approved=False).save()
        super(Dish, self).save(**kwargs)

    def __unicode__(self):
        return self.name
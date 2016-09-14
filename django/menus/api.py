from tastypie import fields, utils
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from sopin.menus.models import Restaurant, Dish, DishType, RestaurantDishType, Kitchen, Indgredient

class RestaurantResource(ModelResource):
    class Meta:
        resource_name = 'restaurants'
        queryset = Restaurant.objects.all()

class DishResource(ModelResource):
    class Meta:
        resource_name = 'dishes'
        queryset = Dish.objects.all()

class DishTypeResource(ModelResource):
    class Meta:
        resource_name = 'sopin_dishtypes'
        queryset = DishType.objects.all()

        filtering = {
            'name': ALL_WITH_RELATIONS
        }

class RestaurantDishTypeResource(ModelResource):
    class Meta:
        resource_name = 'dishtypes'
        queryset = RestaurantDishType.objects.all()

        filtering = {
            'name': ALL_WITH_RELATIONS
        }

class KitchenResource(ModelResource):
    class Meta:
        resource_name = 'kitchens'
        queryset = Kitchen.objects.all()

        filtering = {
            'name': ALL_WITH_RELATIONS
        }

class IndgredientResource(ModelResource):
    class Meta:
        resource_name = 'indgredients'
        queryset = Indgredient.objects.filter(approved=True)

        filtering = {
            'name': ALL_WITH_RELATIONS
        }

class DishFlattenedResource(ModelResource):
    restaurant = fields.ForeignKey(RestaurantResource, 'restaurant')
    kitchen = fields.ForeignKey(KitchenResource, 'kitchen')
    dishtype = fields.ForeignKey(RestaurantDishTypeResource, 'dishtype')
    sopin_dishtype = fields.ForeignKey(DishTypeResource, 'sopin_dishtype')

    class Meta:
        resource_name = 'dishes_flat'
        queryset = Dish.objects.select_related('restaurant', 'dishtype', 'sopin_dishtype', 'kitchen')
        filtering = {
            'kitchen': ALL_WITH_RELATIONS,
            'dishtype': ALL_WITH_RELATIONS,
            'sopin_dishtype': ALL_WITH_RELATIONS
        }

    def dehydrate(self, bundle):
        bundle.data['sopin_dishtype_flat'] = bundle.obj.sopin_dishtype.name
        bundle.data['kitchen_flat'] = bundle.obj.kitchen.name
        bundle.data['indgredients'] = bundle.obj.indgredients
        return bundle



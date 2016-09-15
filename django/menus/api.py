"""
(class\s)(.*)(ViewSet\(ModelViewSet\):)
class \2Serializer(ModelSerializer):\n    class Meta:\n        model = \2\n        fields = '__all__'\n\n\1\2\3\n    serializer = \2Serializer
"""
from menus.models import Restaurant, Dish, DishType, RestaurantDishType, Kitchen, Indgredient
from rest_framework.viewsets import ModelViewSet

class RestaurantSerializer(ModelSerializer):
    class Meta:
        model = Restaurant
        fields = '__all__'

class RestaurantViewSet(ModelViewSet):
    serializer = RestaurantSerializer
    queryset = Restaurant.objects.all()

class DishSerializer(ModelSerializer):
    class Meta:
        model = Dish
        fields = '__all__'

class DishViewSet(ModelViewSet):
    serializer = DishSerializer
    queryset = Dish.objects.all()

class DishTypeSerializer(ModelSerializer):
    class Meta:
        model = DishType
        fields = '__all__'

class DishTypeViewSet(ModelViewSet):
    serializer = DishTypeSerializer
    queryset = DishType.objects.all()

class RestaurantDishTypeSerializer(ModelSerializer):
    class Meta:
        model = RestaurantDishType
        fields = '__all__'

class RestaurantDishTypeViewSet(ModelViewSet):
    serializer = RestaurantDishTypeSerializer
    queryset = RestaurantDishType.objects.all()

class KitchenSerializer(ModelSerializer):
    class Meta:
        model = Kitchen
        fields = '__all__'

class KitchenViewSet(ModelViewSet):
    serializer = KitchenSerializer
    queryset = Kitchen.objects.all()

class IndgredientSerializer(ModelSerializer):
    class Meta:
        model = Indgredient
        fields = '__all__'

class IndgredientViewSet(ModelViewSet):
    serializer = IndgredientSerializer
    queryset = Indgredient.objects.filter(approved=True)

class DishFlattenedSerializer(ModelSerializer):
    class Meta:
        model = DishFlattened
        fields = '__all__'

class DishFlattenedViewSet(ModelViewSet):
    serializer = DishFlattenedSerializer
    queryset = Dish.objects.select_related('restaurant', 'dishtype', 'sopin_dishtype', 'kitchen')
        


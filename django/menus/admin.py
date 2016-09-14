from django.contrib import admin
from sopin.menus.models import Restaurant, Dish, DishType, RestaurantDishType, Kitchen, Indgredient

class ObjInline(admin.TabularInline):
    def __init__(self, parent_model, admin_site, obj=None):
        self.obj = obj
        super(ObjInline, self).__init__(parent_model, admin_site)

class ObjAdmin(admin.ModelAdmin):

    def get_inline_instances(self, request, obj=None):
        inline_instances = []
        for inline_class in self.inlines:
            inline = inline_class(self.model, self.admin_site, obj)
            if request:
                if not (inline.has_add_permission(request) or
                        inline.has_change_permission(request, obj) or
                        inline.has_delete_permission(request, obj)):
                    continue
                if not inline.has_add_permission(request):
                    inline.max_num = 0
            inline_instances.append(inline)

        return inline_instances

class DishInline(ObjInline):
    model = Dish

    def formfield_for_foreignkey(self, db_field, request=None, **kwargs):
        field = super(DishInline, self).formfield_for_foreignkey(db_field, request, **kwargs)
        if db_field.name == 'dishtype':
            if self.obj is not None:
                field.queryset = field.queryset.filter(restaurant__exact = self.obj)  
            else:
                field.queryset = field.queryset.none()

        return field

class RestaurantDishTypeInline(ObjInline):
    model = RestaurantDishType

class RestaurantDishTypeAdmin(admin.ModelAdmin):
    list_display = ('__unicode__', 'restaurant')

class RestaurantAdmin(ObjAdmin):
    inlines = [
        DishInline,
        RestaurantDishTypeInline
    ]

class DishAdmin(admin.ModelAdmin):
    search_fields = ('indgredients',)
    list_display = ('__unicode__', 'indgredients', 'name', 'restaurant', 'number', 'dishtype','sopin_dishtype')
    list_editable = ('name', 'indgredients')
    ordering = ('restaurant', 'number', 'dishtype')
    list_filter = ('restaurant', 'sopin_dishtype')

class IndgredientAdmin(admin.ModelAdmin):
    search_fields = ('name','approved')
    list_display = ('name', 'approved')
    list_filter = ('approved',)
    list_editable = ('approved',)

admin.site.register(Restaurant, RestaurantAdmin)
admin.site.register(Dish, DishAdmin)
admin.site.register(DishType)
admin.site.register(RestaurantDishType, RestaurantDishTypeAdmin)
admin.site.register(Kitchen)
admin.site.register(Indgredient, IndgredientAdmin)
from django import template
from django.template.defaultfilters import safe

register = template.Library()

@register.filter(name='multiply')
def multiply(value, arg):
    try:
        return int(value) * int(arg)
    except (ValueError, TypeError):
        return ''

@register.simple_tag
def get_menu_padding(level):
    return level * 15

@register.inclusion_tag('partials/menu_items.html')
def render_menu_items(menu_items):
    return {'menu_items': menu_items} 
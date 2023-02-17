from django import template
from django.utils.safestring import mark_safe
import json

register = template.Library()

@register.filter(name='dict_key')
def dict_key(d, key):
    if d[key]:
        return d[key]
    else:
        return ""
    
    
@register.filter(is_safe=True)
def js(obj):
    return mark_safe(json.dumps(obj))
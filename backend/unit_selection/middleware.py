# from django.conf import settings
# from django.utils import translation
# from django.utils.deprecation import MiddlewareMixin

# class AdminLocaleMiddleware(MiddlewareMixin):
#     def process_request(self, request):
#         if request.path.startswith('/admin'):
            
#             request.LANG = getattr(settings, 'ADMIN_LANGUAGE_CODE',
#                                    settings.LANGUAGE_CODE)
#             translation.activate(request.LANG)
#             request.LANGUAGE_CODE = request.LANG
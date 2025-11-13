from rest_framework import permissions

class IsGestor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_superuser or 
            request.user.groups.filter(name='Gestores').exists()
        )
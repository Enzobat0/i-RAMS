from rest_framework import permissions

class CanRecordSurvey(permissions.BasePermission):
    """
    All authenticated users in our system can record surveys.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated 
    
class IsEngineer(permissions.BasePermission):
    """
    Only users with the 'engineer' role can access analytical/MCDA dashboards.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['SENIOR_ENGINEER', 'DISTRICT_ENGINEER']
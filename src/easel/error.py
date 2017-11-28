from django.http import JsonResponse


def JsonErrorResponse(status_code, messages):
    response = JsonResponse({"errors": messages})
    response.status_code = status_code  # Bad Request
    return response


def Json400():
    return JsonErrorResponse(404, ['Received Bad arguments'])


def Json405(allowed_method):
    return JsonErrorResponse(405, ['Only %s method is allowed'
                                   % allowed_method])

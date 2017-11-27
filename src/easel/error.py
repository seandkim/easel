from django.http import HttpResponse


def Http400():
	return HttpResponse('400 Bad Request', status=400)

def Http405():
	return HttpResponse('405 Method Not Allowed',status=405)

def Http500():
	return HttpResponse('500 Internal Error', status=500)
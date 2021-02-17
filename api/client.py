import os
import requests


def get(path, params={}):
    response = requests.get(endpoint(path), headers=headers(), params=params)
    if response.status_code == 200:
        return success_response(response.json())
    else:
        return error_response()


def put(path, data):
    response = requests.put(endpoint(path), headers=headers(), json=data)
    if response.status_code == 200:
        return success_response(response.json())
    else:
        return error_response()


def post(path, data):
    response = requests.post(endpoint(path), headers=headers(), json=data)
    if response.status_code == 200:
        return success_response(response.json())
    else:
        return error_response()


def endpoint(path):
    return f"{os.environ.get('API_ENDPOINT', 'http://localhost:3000')}{path}"


def headers():
    return {
        'X-Company-Token': os.environ.get('X_COMPANY_TOKEN', ''),
        'X-User-Company': os.environ.get('X_USER_COMPANY', ''),
        'X-User-Token': os.environ.get('X_USER_TOKEN', ''),
        'X-User-Email': os.environ.get('X_USER_EMAIL', '')
    }


def error_response():
    return {'status': False, 'message': 'API Failed'}


def success_response(data):
    return {'status': True, 'message': 'Success', 'data': data}

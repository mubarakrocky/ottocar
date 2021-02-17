from flask import Flask, request
import api.client as client
from api.util import format_bs_response, build_change_params, bsl_data, apply_fees
from flask_cors import CORS
app = Flask(__name__)
# Allow Cross Origin Requests
CORS(app)


@app.route('/subscriptions')
def subscriptions():
    subscription_id = request.args.get('id')
    params = {}
    if subscription_id:
        params['id'] = subscription_id
    return client.get('/subscriptions', params)


@app.route('/subscriptions/<subscription_id>')
def subscription_show(subscription_id):
    return client.get(f'/subscriptions/{subscription_id}')


@app.route('/billing_schedules/<billing_schedule_id>')
def billing_schedule(billing_schedule_id):
    response = client.get(f'/billing_schedules/{billing_schedule_id}')
    if response['status']:
        return format_bs_response(response)
    else:
        return response


@app.route('/subscriptions/<subscription_id>/change', methods=['PUT'])
def change_subscription(subscription_id):
    """
    Called when a subscription is applied holiday pause

    Request body looks like:
    {
        subscription: Subscription Object From Ordway,
        changes: input,
        charge: Charge Object inside Subscription object that is extending,
        billing_schedule: BillingSchedule Object From Ordway
    }
    """
    change_request = build_change_params(request.json)
    # Extend the existing contract
    client.put(f'/subscriptions/{subscription_id}/change', change_request)
    bs_request_data = bsl_data(request.json)
    apply_fees(request.json)
    return client.put(f"/billing_schedules/{bs_request_data['id']}", bs_request_data)


@app.route('/customers/<customer_id>')
def customer_show(customer_id):
    return client.get(f'/customers/{customer_id}')

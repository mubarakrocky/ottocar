from itertools import groupby
from datetime import date, datetime, timedelta
import math
import os
from calendar import monthrange, calendar
import api.client as client


def format_bs_response(bs_response):
    """
    This method format the billing schedule APIs response to add details
    """
    billing_schedule = bs_response['data']
    key_metrics = billing_schedule.get('key_metrics', {})
    line = single_schedule_line(billing_schedule['schedule_lines'])
    details = {
        'remaining_contract_balance': float(key_metrics['total_contract_revenue']) - float(
            key_metrics['amount_invoiced']),
        'single_schedule_price': line['amount'],
        'remaining_schedule': remaining_schedule_count(billing_schedule['schedule_lines']),
        'unpaid_balance': current_unpaid_balance(billing_schedule['schedule_lines']),
        'last_12_months_irregularity': last_12_months_irregularity(billing_schedule['schedule_lines']),
        'last_irregular_date': last_irregular_date(billing_schedule['schedule_lines']),
    }
    bs_response['data']['details'] = details
    return bs_response


def last_12_months_irregularity(lines):
    """
    This method calculates the irregularities in the last 12 months
    """
    significant_line = single_schedule_line(lines)
    irregular_lines = []
    current_date = date.today()
    last_year_date = current_date - timedelta(days=365)
    for line in lines:
        if float(line['amount']) < float(significant_line['amount']) and current_date >= convert_to_date(
                line['charge_ready_date']) >= last_year_date:
            irregular_lines.append(line)
    return len(irregular_lines)


def last_irregular_date(lines):
    """
    The last irregular date in lines
    """
    significant_line = single_schedule_line(lines)
    lines_sorted = sorted(lines, key=lambda bsl: bsl['charge_ready_date'], reverse=True)
    for line in lines_sorted:
        if float(line['amount']) < float(significant_line['amount']):
            return line['charge_ready_date']


def single_schedule_line(lines):
    """
    Single Schedule Line is the most occurring price in the lines
    """
    size = 0
    single_line = None
    for amount, group in groupby(lines, lambda line: float(line['amount'])):
        list_group = list(group)
        group_size = len(list_group)
        if group_size > size:
            size = group_size
            single_line = list_group[0]

    return single_line


def selected_periods_bsls(lines, period, effective_date):
    """
    The billing schedule lines selected to deffer
    """
    unpaid_lines = unpaid_bs_lines(lines)
    selected_lines = []
    for line in unpaid_lines:
        if period <= 0:
            break
        if line['start_date'] < effective_date:
            continue
        selected_lines.append(line)
        period -= 1
    return selected_lines


def remaining_schedule_count(lines):
    return len(unpaid_bs_lines(lines))


def unpaid_bs_lines(lines):
    return sorted(filter(lambda line: line['invoiced'] == 'No', lines), key=lambda line: line['charge_ready_date'])


def current_unpaid_balance(lines):
    current_date = date.today()
    unpaid = filter(lambda line: line['invoiced'] == 'No' and convert_to_date(line['charge_ready_date']) <= current_date, lines)
    return sum(float(line['amount']) for line in unpaid)


def convert_to_date(date_str):
    if date_str is None:
        return
    return date.fromisoformat(date_str)


def build_change_params(requests):
    end_date = extended_date(requests)
    subscription = requests['subscription']
    apply_charges_end_date(subscription, requests['charge'], end_date)
    subscription['current_term_end_date'] = end_date.isoformat()
    subscription['initial_term'] = 0
    subscription['contract_term'] = 'custom'
    subscription['contract_effective_date'] = requests['changes']['effective_date']
    return subscription


def apply_charges_end_date(subscription, charge, end_date):
    """
    Make charge end date to change wrt contract extension
    """
    for plan in subscription['plans']:
        if plan['subscription_line_id'] == charge['subscription_line_id']:
            plan['charge_end_date'] = plan['end_date'] = end_date.isoformat()


def term_days(bsl):
    """
    Contract single period days
    """
    return (convert_to_date(bsl['end_date']) - convert_to_date(bsl['start_date'])) + timedelta(days=1)


def total_amount_to_extend(applicable_lines, rate):
    """
    The actual amount to be extended to the end of current contract
    """
    amount = 0
    for line in applicable_lines:
        amount += float(line['amount']) - float(rate)
    return amount


def extended_date(requests):
    """
    Find the date for the subscription should be extended
    """
    changes = requests['changes']
    subscription = requests['subscription']
    schedule_lines = requests['billing_schedule']['schedule_lines']

    additional_terms = additional_no_of_terms(schedule_lines, changes)
    subscription_term_end_date = convert_to_date(subscription.get('current_term_end_date', None))
    # Now only considering monthly and day wise
    if term_type(schedule_lines) == 'monthly':
        return add_months(subscription_term_end_date, additional_terms)

    terms = term_days(single_schedule_line(schedule_lines))
    return subscription_term_end_date + terms * additional_terms


def add_months(sourcedate, months):
    month = sourcedate.month - 1 + months
    year = sourcedate.year + month // 12
    month = month % 12 + 1
    day = min(sourcedate.day, calendar.monthrange(year, month)[1])
    return datetime.date(year, month, day)


def term_type(schedule_lines):
    if len(schedule_lines) > 1:
        is_monthly = False
        for line in [schedule_lines[-2], schedule_lines[2]]:
            start_date = convert_to_date(line['start_date'])
            is_monthly = term_days(line) == monthrange(start_date.year, start_date.month)
            if not is_monthly:
                break
        if is_monthly:
            return 'monthly'
        # Now only checking for days and monthly
        return 'days'
    else:
        return 'days'


def bsl_data(requests):
    """
    This method construct the new billing schedule lines
    """
    billing_schedule = requests['billing_schedule']
    changes = requests['changes']
    # Set the Billing Schedule to newly formatted lines
    billing_schedule['schedule_lines'] = edited_bsls(billing_schedule, changes)
    return billing_schedule


def edited_bsls(billing_schedule, changes):
    """
    Edit already saved BSLs to the way to reflect new changes
    """
    old_bsls = billing_schedule['schedule_lines']
    number_of_period_changed = int(changes['number_of_periods'])
    rate_applied = float(changes['rate'])
    no_of_terms_added = additional_no_of_terms(old_bsls, changes)
    # Fetch the newly created billing schedules from platform
    new_bsls = client.get(f"/billing_schedules/{billing_schedule['id']}")['data']['schedule_lines']
    # Filter out invoiced BSLs and sort by charge ready date
    filtered_bsls = unpaid_bs_lines(new_bsls)
    unpaid_old_bsls = unpaid_bs_lines(old_bsls)
    # Find the old line
    old_bsl = single_schedule_line(old_bsls)
    previous_rate = float(old_bsl['amount'])
    delta = edit_selected_periods(unpaid_old_bsls, number_of_period_changed, rate_applied, changes)
    if no_of_terms_added <= 0:
        for _x in range(abs(no_of_terms_added)):
            if len(unpaid_old_bsls) > number_of_period_changed:
                bsl = unpaid_old_bsls.pop()
                delta += float(bsl['amount'])
        last_line = unpaid_old_bsls[-1]
        line_amount = float(last_line['amount'])
        # Accommodate remaining delta in last line
        last_line['unit_price'] = unit_price(line_amount + delta, last_line)
        return unpaid_old_bsls
    # Add the delta to last BSLs previous line if the previous line was not fully even to other lines
    previous_last_line = unpaid_old_bsls[-1]
    line_amount = float(previous_last_line['amount'])
    if previous_rate > line_amount:
        if line_amount + delta < previous_rate:
            previous_last_line['unit_price'] = unit_price(line_amount + delta, previous_last_line)
            delta = 0
        else:
            previous_last_line['unit_price'] = unit_price(previous_rate, previous_last_line)
            delta -= float(previous_rate) - line_amount
    if no_of_terms_added > 0:
        # Add the deferred/changed rate to end of lines that were added
        for bsl in filtered_bsls[-no_of_terms_added:]:
            if delta > previous_rate:
                bsl['unit_price'] = unit_price(previous_rate, bsl)
                delta -= previous_rate
            else:
                bsl['unit_price'] = unit_price(delta, bsl)
                delta = 0
            # Append newly created lines
            unpaid_old_bsls.append(bsl)
    return unpaid_old_bsls


def edit_selected_periods(unpaid_old_bsls, number_of_period_changed, rate_applied, changes):
    delta = 0
    # Update the selected periods to new rate for which should be after or on effective dates
    for bsl in unpaid_old_bsls:
        if number_of_period_changed <= 0:
            break
        if bsl['start_date'] < changes['effective_date']:
            continue
        delta += float(bsl['amount']) - rate_applied
        bsl['unit_price'] = unit_price(rate_applied, bsl)
        number_of_period_changed -= 1

    return delta


def unit_price(total, bsl):
    quantity = float(bsl['quantity'])
    discount = float(bsl['discount'])
    if discount >= 100:
        return 0
    return total /(quantity - (quantity * discount / 100))


def additional_no_of_terms(schedule_lines, changes):
    """
    Find the additional terms to be added at the end of current contract

    """
    number_of_periods = int(changes['number_of_periods'])
    applicable_lines = selected_periods_bsls(schedule_lines, number_of_periods, changes['effective_date'])
    defer_amount = total_amount_to_extend(applicable_lines, changes['rate'])
    # Find the single line whose amount is occurring greater in count
    bsl = single_schedule_line(schedule_lines)
    schedule_price = float(bsl['amount'])
    change_price = defer_amount
    if schedule_price <= 0:
        return 0
    return math.ceil(change_price / schedule_price)


def apply_fees(request):
    """
    Create order for a specified charge if the fees amount is greater than 0
    """
    changes = request['changes']
    fees = float(changes['fees'])
    subscription = request['subscription']
    if fees > 0:
        order = {
            'customer_id': subscription['customer_id'],
            'order_date': date.today().isoformat(),
            'status': 'Fulfilled',
            'line_items': [
                {
                    'line_no': 1,
                    'product_id': os.environ.get('LATE_FEES_PRODUCT_ID'),
                    "description": "Fees for extending contract",
                    'unit_price': fees,
                    'quantity': 1,
                    'discount': 0
                }
            ]
        }
        client.post('/orders', order)

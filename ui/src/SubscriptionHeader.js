import {Grid} from "@material-ui/core";
import {formatCurrency} from "./Utils";

export default function SubscriptionHeader(props) {
    const subscription = props.subscription
    const plan = props.plan
    const billingSchedule = props.billingSchedule
    const customer = props.customer
    return (
        <Grid item xs={12} className="grid-section">
            <h3>Contract Summary</h3>
            <Grid container justify="center" spacing={2}>
                <Grid item xs={6}>
                    <Grid className="AttributeList">
                        <div className="Label">Subscription ID</div>
                        <div className="LabelValue">{subscription.id}</div>
                    </Grid>
                    <Grid className="AttributeList">
                        <div className="Label">Customer ID</div>
                        <div className="LabelValue">{subscription.customer_id}</div>
                    </Grid>
                    <Grid className="AttributeList">
                        <div className="Label">Customer Name</div>
                        <div className="LabelValue">{customer.name}</div>
                    </Grid>
                    {props.showCharge ?
                        <div>
                            <Grid className="AttributeList">
                                <div className="Label">Subscription Charge ID</div>
                                <div className="LabelValue">{plan.subscription_line_id}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Charge</div>
                                <div className="LabelValue">{plan.charge_name}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Plan</div>
                                <div className="LabelValue">{plan.plan_name}</div>
                            </Grid>
                        </div>
                        :
                        ''
                    }
                </Grid>
                <Grid item xs={6}>
                    {props.showCharge ?
                        <div>
                            <Grid className="AttributeList">
                                <div className="Label">Billing Period</div>
                                <div className="LabelValue">{plan.billing_period}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Current Term Start Date</div>
                                <div className="LabelValue">{subscription.current_term_start_date}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Current Term End Date</div>
                                <div className="LabelValue">{subscription.current_term_end_date}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Remaining Contract Balance</div>
                                <div
                                    className="LabelValue">{formatCurrency(billingSchedule.details.remaining_contract_balance)}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Single Schedule Price</div>
                                <div
                                    className="LabelValue">{formatCurrency(billingSchedule.details.single_schedule_price)}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Remaining Billing Schedules</div>
                                <div className="LabelValue">{billingSchedule.details.remaining_schedule}</div>
                            </Grid>
                        </div>
                        :
                        <div>
                            <Grid className="AttributeList">
                                <div className="Label">Status</div>
                                <div className="LabelValue">{subscription.status}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Renewal Term</div>
                                <div className="LabelValue">{getRenewalTerm(subscription)}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Contract Term</div>
                                <div className="LabelValue">{getContractTerm(subscription)}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Current Term Start Date</div>
                                <div className="LabelValue">{subscription.current_term_start_date}</div>
                            </Grid>
                            <Grid className="AttributeList">
                                <div className="Label">Current Term End Date</div>
                                <div className="LabelValue">{subscription.current_term_end_date}</div>
                            </Grid>
                        </div>
                    }
                </Grid>
            </Grid>
        </Grid>
    )
}

function getContractTerm(subscription) {
    if (subscription.contract_term !== 'Evergreen') {
        return subscription.contract_term + ' Months'
    }
    return subscription.contract_term
}

function getRenewalTerm(subscription) {
    return subscription.renewal_term ? subscription.renewal_term : 'N / A'
}

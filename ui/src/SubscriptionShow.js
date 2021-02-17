import {
    Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Grid,
} from "@material-ui/core";
import 'date-fns';
import { useParams } from "react-router-dom";
import {useEffect, useState} from "react";
import Api from "./Api";
import SubscriptionHeader from "./SubscriptionHeader";
import HolidayEligibleInfo from "./HolidayEligibleInfo";
import Plan from "./Plan";

export default function SubscriptionShow(props) {
    const showCharge = props.showCharge

    const {subscription_id, charge_id} = useParams();

    let [subscription, setSubscription] = useState({plans: []})
    let [charge, setCharge] = useState({})
    let [notFound, setNotFound] = useState(false)
    let [holidayEligible, setHolidayEligible] = useState(true)
    let [billingSchedule, setBillingSchedule] = useState({details: {}})
    let [customer, setCustomer] = useState({})


    useEffect(() => {
        if (!showCharge || subscription.plans.length === 0) return

        const planCharge = subscription.plans.find((plan) => (plan.subscription_line_id === charge_id));
        if (planCharge) {
            setCharge(planCharge)

            setHolidayEligible((planCharge.charge_type === 'Recurring' && subscription.status === 'Active'
                && subscription.contract_term !== 'Evergreen'))

            Api.get('/billing_schedules/' + planCharge.billing_schedule_id).then((data) => {
                setBillingSchedule(data)
            })
        } else {
            if (showCharge) setNotFound(true)
        }
    }, [subscription])

    useEffect(() => {
        Api.get('/subscriptions/' + subscription_id).then((data) => {
            setSubscription(data)
            fetchCustomer(data['customer_id'])
        })
    }, [charge_id]);


    const fetchCustomer = (customer_id) => {
        Api.get('/customers/' + customer_id).then((data) => {
            setCustomer(data)
        })
    }

    const handleClose = () => {
        setNotFound(false);
    };

    return (
        <Grid container spacing={3}>
            <Dialog
                open={notFound}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Not Found</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Charge {charge_id} Not Found
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            <SubscriptionHeader subscription={subscription} showCharge={showCharge}
                                plan={charge} billingSchedule={billingSchedule}
                                customer={customer}/>
            {showCharge ?
                <HolidayEligibleInfo holidayEligible={holidayEligible} billingSchedule={billingSchedule}
                                     subscription={subscription} charge={charge}
                                     customer={customer}/>
                :
                <Plan subscription={subscription}></Plan>
            }
        </Grid>
    )
}

import {useState} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Grid, Typography} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {Link} from "react-router-dom";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '25%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '25%',
        color: theme.palette.text.secondary,
    },
}));


export default function Plan(props) {
    const subscription = props.subscription

    const classes = useStyles();

    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Grid item xs={12} className="grid-section">
            <h3>Plans</h3>
            {subscription.plans
                .sort((a, b) => {
                    if (a.subscription_line_id <= b.subscription_line_id) {
                        return -1
                    } else {
                        return 1
                    }
                })
                .map((plan) => (
                    <Accordion key={plan.subscription_line_id} expanded={expanded === plan.subscription_line_id}
                               onChange={handleChange(plan.subscription_line_id)}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                        >
                            <Typography className={classes.heading}>
                                <Link
                                    to={subscription.id + '/' + plan.subscription_line_id}>{plan.subscription_line_id}</Link>
                            </Typography>
                            <Typography className={classes.secondaryHeading}>{plan.charge_id}</Typography>
                            <Typography className={classes.secondaryHeading}>{plan.charge_name}</Typography>
                            <Typography className={classes.secondaryHeading}>{plan.plan_name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ChargeDetails plan={plan}/>
                        </AccordionDetails>
                    </Accordion>
                ))}
        </Grid>
    )
}

function ChargeDetails(props) {
    const plan = props.plan
    return (
        <Grid container>
            <Grid item xs={6}>
                <Grid className="AttributeList">
                    <div className="Label">Charge Type</div>
                    <div className="LabelValue">{plan.charge_type}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Charge Timing</div>
                    <div className="LabelValue">{plan.charge_timing}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Effective Price</div>
                    <div className="LabelValue">{plan.effective_price}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">List Price</div>
                    <div className="LabelValue">{plan.effective_price}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Quantity</div>
                    <div className="LabelValue">{plan.quantity}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Pricing Model</div>
                    <div className="LabelValue">{plan.pricing_model}</div>
                </Grid>
            </Grid>
            <Grid item xs={6}>
                <Grid className="AttributeList">
                    <div className="Label">Plan ID</div>
                    <div className="LabelValue">{plan.plan_id}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Current Period Start Date</div>
                    <div className="LabelValue">{plan.current_period_start_date}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Current Period End Date</div>
                    <div className="LabelValue">{plan.current_period_end_date}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Billing Schedule</div>
                    <div className="LabelValue">{plan.billing_schedule_id}</div>
                </Grid>
                <Grid className="AttributeList">
                    <div className="Label">Revenue Schedule</div>
                    <div className="LabelValue">{plan.revenue_schedule_id}</div>
                </Grid>
            </Grid>
        </Grid>
    )
}

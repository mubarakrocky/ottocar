import {useEffect, useState} from "react";
import Api from "./Api";
import {
    Backdrop,
    Button,
    CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Divider,
    Grid,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import NotInterestedIcon from "@material-ui/icons/NotInterested";
import {makeStyles} from "@material-ui/core/styles";
import {formatCurrency} from "./Utils";

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

export default function HolidayEligibleInfo(props) {
    const billingSchedule = props.billingSchedule
    const classes = useStyles();
    let [showIndicator, setShowIndicator] = useState(false)
    let [effectiveDates, setEffectiveDates] = useState([]);
    let [openSuccess, setOpenSuccess] = useState(false);

    const [input, setInput] = useState({number_of_periods: 1, rate: 0, fees: 0, effective_date: ''})

    const handleInputChange = (event) => setInput({
        ...input,
        [event.target.name]: event.target.value
    })

    useEffect(() => {
        if (billingSchedule.schedule_lines) {
            const dates = billingSchedule.schedule_lines
                .filter((line) => (line.invoiced === 'No'))
                .map((line) => (line.start_date))

            setEffectiveDates(dates)
            setInput({
                ...input,
                effective_date: dates[0]
            })
        }

    }, [billingSchedule])

    const applyCustomPeriods = () => {
        setShowIndicator(true)
        Api.put('/subscriptions/' + props.subscription.id + '/change',
            {
                subscription: props.subscription,
                changes: input,
                charge: props.charge,
                billing_schedule: billingSchedule
            }).then((data) => {
            setShowIndicator(false)
            setOpenSuccess(true)
        })
    }

    return (
        <Grid item xs={12} className="grid-section">
            <Backdrop open={showIndicator} className={classes.backdrop}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <SuccessDialog open={openSuccess} handleClose={() => { window.location.href = '/' + props.subscription.id; }} />
            <h3>Holiday Eligibility Information</h3>
            {props.holidayEligible ?
                <Grid item>
                    <form>
                        <Grid className="AttributeList">
                            <div className="Label">Current Unpaid Balance</div>
                            <div className="LabelValue">{formatCurrency(props.customer.balance)}</div>
                        </Grid>
                        <Grid className="AttributeList">
                            <div className="Label">Holiday Periods Taken In The Last 12 Months</div>
                            <div className="LabelValue">{billingSchedule.details.last_12_months_irregularity}</div>
                        </Grid>
                        {/*<Grid className="AttributeList">*/}
                        {/*    <div className="Label">Last Holiday Week Taken</div>*/}
                        {/*    <div className="LabelValue">*/}
                        {/*        Not Implemented*/}
                        {/*        /!*{billingSchedule.details.last_irregular_date ? billingSchedule.details.last_irregular_date : 'N/A'}*!/*/}
                        {/*    </div>*/}
                        {/*</Grid>*/}
                        <Grid className="AttributeList InputArea">
                            <div className="Label">Number Of Periods For Custom Billing</div>
                            <div className="LabelValue">
                                <TextField label="Periods" value={input.number_of_periods} name="number_of_periods"
                                           onChange={handleInputChange}/>
                            </div>
                        </Grid>
                        <Grid className="AttributeList InputArea">
                            <div className="Label">Custom Rate During This Period</div>
                            <div className="LabelValue">
                                <TextField label="Rate (£)" value={input.rate} name="rate"
                                           onChange={handleInputChange}/>
                            </div>
                        </Grid>
                        <Grid className="AttributeList InputArea">
                            <div className="Label">Effective Date For This Change</div>
                            <div className="LabelValue">
                                <Select onChange={handleInputChange}
                                        name="effective_date"
                                        value={input.effective_date}
                                >
                                    {effectiveDates.map((date) => (
                                        <MenuItem key={date} value={date}>{date}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                        </Grid>
                        <Grid className="AttributeList InputArea MTop10">
                            <div className="Label">Custom Administrative Fees To Asses</div>
                            <div className="LabelValue">
                                <TextField label="Fees (£)" name="fees" value={input.fees}
                                           onChange={handleInputChange}/>
                            </div>
                        </Grid>
                        <Divider></Divider>
                        <Grid className="AttributeList InputArea ActionGroup">
                            <div className="Label">&nbsp;</div>
                            <div className="LabelValue">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<SaveIcon/>}
                                    onClick={applyCustomPeriods}
                                >
                                    Apply
                                </Button>
                            </div>

                        </Grid>
                    </form>
                </Grid>
                :
                <div>
                    <NotInterestedIcon className="f-left"></NotInterestedIcon>
                    <Typography className="f-left">Not Applicable</Typography>
                </div>
            }
        </Grid>
    )
}

function SuccessDialog(props) {
    return(
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"The Changes Applied To Contract"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    The contract has been extended based on the parameters supplied.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}

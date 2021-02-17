import {useEffect, useState} from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import SearchBar from "material-ui-search-bar"
import { Link } from 'react-router-dom'
import Api from './Api';
import Container from "@material-ui/core/Container";
import {Grid} from "@material-ui/core";

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});


export default function SubTable() {
    const classes = useStyles();

    let [ subscriptions, setSubscriptions ] = useState([])
    let [ idQuery, setIdQuery ] = useState('')


    useEffect(() => {
        fetchSubscriptions()
    }, [idQuery]);

    let fetchSubscriptions = () => {
        Api.get('/subscriptions?id=' + idQuery).then((data) => {
            setSubscriptions(data)
        })
    };

    return (
        <Grid container>
            <Grid item  className="MTop10" xs={12}>
                <Grid item>
                    <SearchBar placeholder="Search by subscription id"
                               value={idQuery}
                               onChange={(newValue) => (setIdQuery(newValue))}
                               onCancelSearch={() => (setIdQuery(''))}
                    />
                </Grid>
            </Grid>
            <Grid item className="MTop10" xs={12}>
                <Grid item>
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="caption table">
                            <caption>Showing {subscriptions.length} subscriptions from Ordway</caption>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Subscription ID</TableCell>
                                    <TableCell align="right">Customer ID</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                    <TableCell align="right">Start Date</TableCell>
                                    <TableCell align="right">End Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subscriptions.map((subscription) => (
                                    <TableRow key={subscription.id}>
                                        <TableCell component="th" scope="row">
                                            <Link to={subscription.id}>{subscription.id}</Link>
                                        </TableCell>
                                        <TableCell align="right">{subscription.customer_id}</TableCell>
                                        <TableCell align="right">{subscription.status}</TableCell>
                                        <TableCell align="right">{subscription.current_term_start_date}</TableCell>
                                        <TableCell align="right">{subscription.current_term_end_date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Grid>
    );
}

import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";

import SubTable from "./SubTable";
import SubscriptionShow from "./SubscriptionShow";


export default function MainRouter() {
    return (
        <Router>
            <Switch>
                <Route path="/:subscription_id/:charge_id" children={<SubscriptionShow showCharge={true} />} />
                <Route path="/:subscription_id" children={<SubscriptionShow />} />
                <Route path="/" children={<SubTable />} />
            </Switch>
        </Router>
    );
}


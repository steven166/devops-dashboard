import * as React from "react";
import {Redirect, Route, Switch} from "react-router";
import DashboardComponent from "../dashboard/DashboardComponent";
import SideBar from "../sidebar/SideBar";
import "./DashboardPage.css";

export default class DashboardPage extends React.Component<any, any> {
  
  public render() {
    return (
      <div className="dashboard-page">
        <SideBar project={this.props.match.params.projectId} history={this.props.history}/>
        <div className="content">
          <Switch>
            <Route path="/:projectId/dashboard" exact={true} component={DashboardComponent} />
            <Redirect path="/:projectId" exact={true} to={"/" + this.props.match.params.projectId + "/dashboard"} />
          </Switch>
        </div>
      </div>
    );
  }
  
}

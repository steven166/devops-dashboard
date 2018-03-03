import * as React from "react";
import SideBar from "../sidebar/SideBar";

export default class DashboardPage extends React.Component<any, any> {

  public render() {
    return (
      <div className="dashboard-page">
        <SideBar project={this.props.match.params.projectId} history={this.props.history}/>
      </div>
    );
  }

}

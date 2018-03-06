import {StateList} from "crud-api-factory";
import * as React from "react";
import {reposCollection} from "../../collections/repos/repos.collection";
import {Repo} from "../../collections/repos/repos.model";
import RepoOverview from "../repo-overview/RepoOverview";
import "./DashboardComponent.css";

export default class DashboardComponent extends React.Component<any, { repos: Repo[] }> {
  
  constructor(props: any) {
    super(props);
    let repoList = new StateList<Repo>(reposCollection.client, {
      selector: {
        projectId: this.props.match.params.projectId
      },
      includes: ["branches", "pull-requests"]
    });
    this.state = {repos: repoList.items};
    repoList.stream.subscribe(items => {
      this.setState({repos: items});
    });
  }
  
  public render() {
    
    return (
      <div className="dashboard-content">
        {this.state.repos.map(repo => <RepoOverview key={repo._id} repo={repo}/>)}
      </div>
    );
  }
  
}

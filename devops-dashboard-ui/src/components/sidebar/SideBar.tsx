import { Project } from "collections/projects/project.model";
import * as React from "react";
import {} from "react-router-dom";
import { projectList } from "../../collections/projects/projects.collection";

export default class SideBar extends React.Component<{ project: string, history: any }, { projects: Project[] }> {

  private mounted: boolean;

  constructor(props: { project: string, history: any }) {
    super(props);
    this.state = { projects: [] };
    projectList.stream.subscribe(projects => {
      this.setState({ projects });
    });
    this.handleNavigate = this.handleNavigate.bind(this);
  }

  public setState(state: { projects: Project[] }) {
    if (this.mounted) {
      this.setState(state);
    } else {
      this.state = state;
    }
  }

  public componentDidMount() {
    this.mounted = true;
  }

  public handleNavigate(event: any) {
    this.props.history.push(`/${event.target.value}`);
  }

  public render() {
    return (
      <div className="sidebar">
        <select onChange={this.handleNavigate}>
          {this.state.projects.map(project => {
            return <option
              key={project._id}
              value={project._id}
              selected={this.props.project === project._id}
            >
              {project.name}
            </option>;
          })}
        </select>
      </div>
    );
  }

}

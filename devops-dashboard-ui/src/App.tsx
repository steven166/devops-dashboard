import { createHashHistory } from "history";
import { getMuiTheme } from "material-ui/styles";
import { blue400, blue500, blue700, orange200 } from "material-ui/styles/colors";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import * as React from "react";
import {Redirect, Route, Router, Switch} from "react-router";
import { HashRouter } from "react-router-dom";
import "./App.css";
import { projectList } from "./collections/projects/projects.collection";
import DashboardPage from "./components/pages/DashboardPage";
import SideBar from "./components/sidebar/SideBar";

const muiTheme = getMuiTheme({
  appBar: {
    height: 70,
    color: blue500
  },
  stepper: {
    iconColor: blue400
  },
  palette: {
    primary1Color: blue500,
    primary2Color: blue700,
    accent1Color: orange200
  }
});

let history = createHashHistory();

class App extends React.Component {

  public render() {
    return (
      <div className="root">
        <HashRouter>
          <MuiThemeProvider muiTheme={muiTheme}>
            <Router history={history}>
              <Switch>
                <Route path="/:projectId" component={DashboardPage}/>
                {/*<Redirect to="/"/>*/}
              </Switch>
            </Router>
          </MuiThemeProvider>
        </HashRouter>
      </div>
    );
  }
}

export default App;

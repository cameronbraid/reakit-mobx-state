import React from "react";
import ReactDOM from "react-dom";
import {
  Provider,
  Dialog,
  Button,
  Tab,
  TabList,
  TabPanel,
  RoverState
} from "reakit";
import * as system from "reakit-system-bootstrap";
import { useObserver } from "mobx-react";
import { observable } from "mobx";

class DialogState {
  @observable visible = false;

  hide = () => {
    this.visible = false;
  };
  show = () => {
    this.visible = true;
  };
}
class TabState implements RoverState {
  constructor(props) {
    Object.assign(this, props);

    if (props.selectedId) {
      this.currentId = props.selectedId;
    }
  }

  @observable unstable_baseId = "tab-1";

  @observable loop = true;
  @observable manual = false;
  @observable unstable_moves = 0;

  @observable __stops = [];

  @observable unstable_pastId: string;

  // selected
  @observable selectedId: string;

  // focus
  @observable currentId: string;

  @observable orientation: string = "horizontal" | "vertical";

  move = (id: string) => {
    if (id === this.currentId) return;

    const index = this.__stops.findIndex(stop => stop.id === id);

    // Item doesn't exist, so we don't count a move
    if (index === -1) {
      return;
    }

    this.currentId = id;
    this.unstable_pastId = id;
    this.unstable_moves++;
  };

  select = (id: string) => {
    this.selectedId = id;
    // this.currentId = id;
  };

  register = (id: string, ref) => {
    const index = this.__stops.findIndex(stop => stop.id === id);
    if (index >= 0) {
      return;
    }
    this.__stops.push({ id, ref });
  };

  unregister = (id: string) => {
    const index = this.__stops.findIndex(stop => stop.id === id);
    if (index >= 0) {
      this.__stops.splice(index, 1);
    }
  };

  __move = (direction: -1 | 1) => {
    if (this.currentId == null) {
      this.move(this.__stops.length > 0 ? this.__stops[0].id : null);
    }

    const index = this.__stops.findIndex(stop => stop.id === this.currentId);

    // If loop is truthy, turns [0, currentId, 2, 3] into [currentId, 2, 3, 0]
    // Otherwise turns into [currentId, 2, 3]

    let nextIndex = index + direction;
    if (this.loop) {
      if (nextIndex < 0) nextIndex += this.__stops.length;
      nextIndex = nextIndex % this.__stops.length;
    }

    if (nextIndex < this.__stops.length && nextIndex > -1) {
      this.move(this.__stops[nextIndex].id);
    }
  };

  next = () => {
    this.__move(1);
  };

  previous = () => {
    this.__move(-1);
  };

  first = () => {
    this.move(this.__stops.length > 0 ? this.__stops[0].id : null);
  };

  last = () => {
    this.move(
      this.__stops.length > 0 ? this.__stops[this.__stops.length - 1].id : null
    );
  };

  unstable_reset = () => {
    this.currentId = null;
    this.unstable_pastId = null;
  };

  unstable_orientate = (orientation: string) => {
    this.orientation = orientation;
  };
}

function App() {
  const [dialog] = React.useState(new DialogState());
  const [tab] = React.useState(
    new TabState({
      manual: true,
      selectedId: "tab1"
      // orientation: "vertical",
    })
  );

  //const tab = useTabState({ manual: true, selectedId: "tab1" });

  const handleOnClick = () => {
    // show dialog only when changing tabs
    if (tab.selectedId !== tab.currentId) {
      dialog.show();
    }
  };
  const handleSave = () => {
    console.log("TODO: handleSave() not yet implemented");
  };
  const handleOnConfirm = () => {
    dialog.hide();
    handleSave();
    // tab.currentId will change when another tab is focused/pressed (before click)
    tab.select(tab.currentId);
  };
  const handleOnCancel = () => {
    dialog.hide();
  };

  React.useEffect(() => {
    if (!dialog.visible) {
      // move focus back after closing dialog
      tab.move(tab.currentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialog.visible, tab.currentId]);
  return useObserver(() => {
    return (
      <React.Fragment>
        <TabList {...tab} aria-label="My tabs">
          <Tab {...tab} stopId="tab1">
            {/* We can use render props to override the underlying onClick */}
            {props => (
              <button {...props} onClick={handleOnClick}>
                Tab 1
              </button>
            )}
          </Tab>
          <Tab {...tab} stopId="tab2">
            {props => (
              <button {...props} onClick={handleOnClick}>
                Tab 2
              </button>
            )}
          </Tab>
          <Tab {...tab} stopId="tab3">
            {props => (
              <button {...props} onClick={handleOnClick}>
                Tab 3
              </button>
            )}
          </Tab>
        </TabList>
        <TabPanel {...tab} stopId="tab1">
          Tab 1
        </TabPanel>
        <TabPanel {...tab} stopId="tab2">
          Tab 2
        </TabPanel>
        <TabPanel {...tab} stopId="tab3">
          Tab 3
        </TabPanel>
        <Dialog {...dialog} role="alertdialog" aria-label="Confirm discard">
          <p>
            Are you sure you want change tab? This will save any changes you
            made.
          </p>
          <div style={{ display: "grid", gridGap: 16, gridAutoFlow: "column" }}>
            <Button onClick={handleOnCancel}>No, do not chage yet!</Button>
            <Button onClick={handleOnConfirm}>Yes, please do it!</Button>
          </div>
        </Dialog>
      </React.Fragment>
    );
  });
}

ReactDOM.render(
  <Provider unstable_system={system}>
    <App />
  </Provider>,
  document.getElementById("root")
);

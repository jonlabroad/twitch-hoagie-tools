import * as React from "react";
import "./App.css";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useEffect, useState } from "react";
import ChromeStorage from "./util/chrome/ChromeStorage";
import Grid from "@mui/material/Grid";
import Config from "./Config";

const App = () => {
  const [chatEval, setChatEval] = useState(true);

  useEffect(() => {
    const chromeStorage = new ChromeStorage();
    async function get() {
      const val = await chromeStorage.getSync([Config.useChatEval]);
      setChatEval(val[Config.useChatEval] ?? true);
    }
    get();
  }, []);

  useEffect(() => {
    async function set() {
      const chromeStorage = new ChromeStorage();
      await chromeStorage.setSync({
        [Config.useChatEval]: chatEval
      });
    }
    set();
  }, [chatEval]);

  return (
    <div className="App">
      <Grid container>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel control={<Switch checked={chatEval} onChange={() => setChatEval(!chatEval)} />} label="Chat Evaluation" />
          </FormGroup>
        </Grid>
      </Grid>
    </div>
  );
};

export default App;

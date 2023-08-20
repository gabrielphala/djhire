import { Load } from "oddlyjs";
import { loadSignal, watch } from "oddlyjs/src/Signal";

import routes from "./routes";
import events from "./events";
import middleware from "./middleware";

routes()
events()
middleware()

Load()

// setTimeout(() => {
//     const sig = loadSignal('count');

//     console.log(sig)

//     sig.value = 'tau';
    
// }, 2000)
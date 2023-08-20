import dj_routes from "./dj";
import organizer_routes from "./organizer";

export default () : void => {
    dj_routes();
    organizer_routes();
}
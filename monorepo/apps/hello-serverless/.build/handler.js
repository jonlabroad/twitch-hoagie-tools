import { helloWorldMessage } from "@hoagie/test";
import { myModuleMessage } from "./src/myModule";
export const helloWorld = async (event) => {
    return {
        statusCode: 200,
        body: `${helloWorldMessage} from ${myModuleMessage}`,
    };
};
//# sourceMappingURL=handler.js.map
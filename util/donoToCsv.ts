import * as data from "./donoData.json";
import * as fs from "fs";

/*
    "redactedUsername": {
        "username": "redacted",
        "value": 500,
        "subs": 0,
        "subgifts": 100,
        "bits": 0,
        "dono": 0,
        "hypechat": 0,
        "subtier": "",
        "userId": "redacted"
    },
*/

const usernames = Object.keys(data);
const csv = usernames.map((username) => {
    const user = data[username];
    return `${username},${user.subgifts},${user.dono},${user.subs},${user.bits},${user.subtier}`;
});

fs.writeFileSync("donoData.csv", ["user,giftsubs,dono,subs,bits,subtier", ...csv].join("\n"));
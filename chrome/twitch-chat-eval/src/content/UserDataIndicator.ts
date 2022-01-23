import { UserDataResponse } from "../HoagieClient";

export default class UserDataIndicator {
    public static setIndicator(element: Element, user: UserDataResponse) {
        let existingIcon = element.querySelector(".user-info-icon");
        if (!existingIcon) {
            existingIcon = document.createElement("span");
            existingIcon.setAttribute("class", "user-info-icon");
            element.append(existingIcon);
        }
        let existingClasses = existingIcon.getAttribute("class") ?? "";
        console.log({existingClasses});

        if (!user.follows && !existingClasses.includes("non-follower-icon")) {
            existingIcon.setAttribute("class", `${existingClasses} non-follower-icon`);
        } else if (user.follows) {
            existingIcon.setAttribute("class", existingClasses.replace("non-follower-icon", ""));
        }
        existingClasses = existingIcon.getAttribute("class") ?? "";

        const creationDate = new Date(user.userData.created_at);
        const currDate = new Date();
        const accountAgeDays = (currDate.getTime() - creationDate.getTime())/1e3 / 60 / 60 / 24;
        console.log({accountAgeDays});
        if (accountAgeDays < 3 && !existingClasses.includes("new-account-icon")) {
            existingIcon.setAttribute("class", `${existingClasses} new-account-icon`);
        } else if (accountAgeDays >= 3) {
            existingIcon.setAttribute("class", existingClasses.replace("new-account-icon", ""));
        }
    }
}
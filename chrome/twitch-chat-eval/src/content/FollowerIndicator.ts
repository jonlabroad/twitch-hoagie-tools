import { FollowResponse } from "../HoagieClient";

export default class FollowerIndicator {
    public static setIndicator(element: Element, follow: FollowResponse) {
        const existingIcon = element.querySelector(".non-follower-icon");
        if (!follow.follows) {
            if (!existingIcon) {
                const icon = document.createElement("span");
                icon.setAttribute("class", "non-follower-icon");
                element.append(icon);
            }
        } else {
            if (existingIcon) {
                existingIcon.remove();
            }
        }
    }
}
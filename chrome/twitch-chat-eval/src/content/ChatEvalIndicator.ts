export default class ChatEvalIndicator {
    public static setIndicator(element: Element, scores: [string, number][]) {
        const currentClass = element.getAttribute("class") ?? "";
        element.setAttribute("class", `${currentClass} highlighted-chat-message`);

        const containerDiv = document.createElement("div");
        containerDiv.setAttribute("class", "evaluation-container");

        const evalTypeDiv = document.createElement("div");
        evalTypeDiv.setAttribute("class", "evaluation-type");
        evalTypeDiv.innerText = `${scores[0][0]}`;

        const evalValDiv = document.createElement("div");
        evalValDiv.setAttribute("class", "evaluation-rating");
        evalValDiv.innerText = `${Math.round(scores[0][1] * 100)}%`;

        containerDiv.appendChild(evalTypeDiv);
        containerDiv.appendChild(evalValDiv);
        element.appendChild(containerDiv);
    }
}
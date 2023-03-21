export const countPoints = (str) => {
    let result = str.match(/\./g);
    if (result) return result.length
    return 0
}

export const getParentId = (questionId) => {
    const arr = questionId.split(".");
    arr.pop();
    return arr.join(".")
}

export const doesQuestionHaveChildren = (questions, questionId) => {
    return questions.filter(q => q.id.startsWith(`${questionId}.`)).length > 0
}

export class LSManager {
    constructor() {
        this.KEY = "questions"
    }
    write(questions) {
        localStorage.setItem(this.KEY, JSON.stringify(questions))
    }
    read() {
        return JSON.parse(localStorage.getItem(this.KEY))
    }
    clear() {
        localStorage.clear();
    }

}

//Sorting indexes function
export const sortByNumber = (a, b) => {
    a = a.id
    b = b.id
    //Split the strings into their parts.
    const a1 = a.split('.');
    const b1 = b.split('.');
    //Contingency in case there's a 4th or 5th version
    const len = Math.min(a1.length, b1.length);
    //Look through each version number and compare.
    for (let i = 0; i < len; i++) {
        const a2 = +a1[i] || 0;
        const b2 = +b1[i] || 0;

        if (a2 !== b2) {
            return a2 > b2 ? 1 : -1;
        }
    }
    return a1.length - b1.length;

}

export const createElement = (tag, className, text) => {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)
    if (text) element.textContent = text
    return element
}

export const addSelectOption = (selectDOMElement, value, text) => {
    const option = document.createElement("option");
    option.text = text;
    option.value = value
    selectDOMElement.add(option);
}
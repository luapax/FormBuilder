import './App.scss';
import { countPoints, LSManager, sortByNumber, createElement, addSelectOption } from './common/Helpers'

//Class Model = data manipulations
class Model {
    constructor() {
        this.questions = [];
        this.questionsCounter = 1;
    }

    findMaxId = (questions) => {
        questions = [...questions.filter(q => !q.id.includes("."))]
        let maxId = -1;
        if (questions.length === 0) {
            maxId = 1;
        }
        else {
            for (let question of questions) {
                if (parseInt(question.id) > maxId) maxId = parseInt(question.id)
            }
        }
        this.questionsCounter = maxId + 1
        console.log(this.questionsCounter)
        return maxId;
    }

    createQuestion(parentId = false) {
        let parentQuestionIndex = this.questions.findIndex(q => q.id === parentId);

        //Adding related question to questions
        if (parentQuestionIndex > -1) {
            let parentQuestion = this.questions[parentQuestionIndex];
            let newQuestionId = `${parentId}.${parentQuestion.childrenCounter}`;
            this.questions[parentQuestionIndex].childrenCounter += 1;
            let newQuestion = { text: "", type: "Yes/No", id: newQuestionId.toString(), childrenCounter: 1 }
            this.questions.push(newQuestion)
        }

        // Adding main question to questions
        else {
            let newQuestion = { text: "", type: "Yes/No", id: this.questionsCounter.toString(), childrenCounter: 1 }
            this.questions.push(newQuestion)
            this.questionsCounter += 1;
        }
        this.sortQuestions()
    }

    removeQuestion(qId) {
        let filteredQuestions = this.questions.filter(q => !q.id.startsWith(qId.toString()))
        this.questions = [...filteredQuestions]
    }

    sortQuestions() {
        this.questions.sort(sortByNumber)
    }

    resetForm() {
        this.questions = [];
    }
}


//Class View = DOM
class View {
    constructor() {
        this.questionsListDOMElement = document.getElementById('questions')
        this.addMainQuestionBtn = document.getElementById('addMainQuestionBtn')
        this.resetFormBtn = document.getElementById('resetFormBtn')
    }

    setup(createQuestion, removeQuestion, resetForm) {
        this.createQuestion = createQuestion;
        this.removeQuestion = removeQuestion;
        this.resetForm = resetForm
        this.addMainQuestionBtn.onclick = () => this.createQuestion(false, { text: "", type: "Yes/No" })
        this.resetFormBtn.onclick = () => this.resetForm()
    }

    render(questions) {
        this.questionsListDOMElement.innerHTML = "";
        for (let q of questions) {
            this.createQuestionDOMElement(q, this.createQuestion)
        }
    }

    createQuestionDOMElement = (question) => {
        //Question box
        const divQuestion = document.createElement("div");
        divQuestion.classList.add('divQuestion')
        divQuestion.setAttribute("questionType", question.type);
        divQuestion.setAttribute("questionId", question.id);

        //Inside of question box
        const divLabels = createElement('div', 'divLabels')
        const labelCondition = createElement('label', '', 'Condition')
        const labelQuestion = createElement('label', '', question.id + " " + 'Question')
        const labelType = createElement('label', '', 'Type')
        divLabels.append(labelCondition, labelQuestion, labelType)

        const divInputs = createElement('div', 'divInputs')

        const divCondition = createElement('div', 'divCondition')
        const selectCondition = createElement('select', 'selectCondition')
        addSelectOption(selectCondition, "Greater than", "Greater than")
        addSelectOption(selectCondition, "Equals", "Equals")
        addSelectOption(selectCondition, "Less than", "Less than")
        const inputCondition = createElement('input', 'inputCondition')
        divCondition.append(selectCondition, inputCondition)

        const inputQuestion = createElement('input', '', question.text)
        inputQuestion.setAttribute("placeholder", 'Write your question..');
        divInputs.append(divCondition, inputQuestion)

        const mainSelect = document.createElement("select")
        addSelectOption(mainSelect, "Yes/No", "Yes/No")
        addSelectOption(mainSelect, "Text", "Text")
        addSelectOption(mainSelect, "Number", "Number")
        divInputs.append(inputQuestion, mainSelect)
        mainSelect.onchange = (e) => {
            divQuestion.setAttribute('questiontype', e.target.value)
        }


        const divBtn = createElement('div', 'divBtn')
        const addSubQBtn = document.createElement('button')
        addSubQBtn.textContent = "Add subquestion"

        addSubQBtn.onclick = () => {
            this.createQuestion(question.id)
        }

        const removeBtn = document.createElement('button')
        removeBtn.textContent = "Remove"
        removeBtn.onclick = () => this.removeQuestion(question.id)
        const leftDistance = countPoints(question.id)

        divBtn.append(addSubQBtn, removeBtn)
        divQuestion.append(divLabels, divInputs, divBtn)

        divQuestion.style.marginLeft = `${leftDistance * 10}px`

        this.questionsListDOMElement.append(divQuestion)

    }

}


//Class Controller = manipulates Class Model and Class View
class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
        this.lsManager = new LSManager()
        this.init()
    }
    init() {
        const savedQuestions = this.lsManager.read();
        if (savedQuestions) {
            this.model.questions = [...savedQuestions]
            this.view.render(this.model.questions)
            this.model.findMaxId(savedQuestions)
        }
    }
    createQuestion = (parentId) => {
        // Add new question to questions
        this.model.createQuestion(parentId);
        // Render questions
        this.view.render(this.model.questions);
        // Save to database
        this.lsManager.write(this.model.questions)
    }
    removeQuestion = (qId) => {
        // Remove question from questions
        this.model.removeQuestion(qId);
        //Re-render questions
        this.view.render(this.model.questions);
        // Re-write database
        this.lsManager.write(this.model.questions)
    }

    resetForm = () => {
        //Remove all questions from questions
        this.model.resetForm()
        //Remove questions from DOM
        this.view.render(this.model.questions);
        //Clean-up database
        this.lsManager.clear();
    }
}

const app = new Controller(new Model(), new View())
app.view.setup(app.createQuestion, app.removeQuestion, app.resetForm)

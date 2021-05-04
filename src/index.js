class Model {
    constructor() {
        this.shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || []
    }

    addToList(productName) {
        const listItem = {
            id: this.shoppingList.length > 0 ? this.shoppingList[this.shoppingList.length - 1].id + 1 : 1,
            product: productName,
            isBought: false
        }

        this.shoppingList.push(listItem);
        this._commit(this.shoppingList)
    }

    editProduct(id, updateName) {
        this.shoppingList = this.shoppingList.map((listItem) => listItem.id === id ? { id: listItem.id, product: updateName, isBought: listItem.isBought } : listItem)
        this._commit(this.shoppingList)
    }

    deleteProduct(id) {
        this.shoppingList = this.shoppingList.filter((product) => product.id !== id)

        this._commit(this.shoppingList)
    }

    toggleProduct(id) {
        this.shoppingList = this.shoppingList.map((listItem) => listItem.id === id ? { id: listItem.id, product: listItem.product, isBought: !listItem.isBought } : listItem)

        this._commit(this.shoppingList)
    }

    bindProductListChanged(callback) {
        this.onProductListChanged = callback
    }

    _commit(shoppingList) {
        this.onProductListChanged(shoppingList)
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList))
    }
}

class View {
    constructor() {
        this.app = this.getElement('#root')

        this.title = this.createElement('h1', 'title')
        this.title.textContent = 'Shopping List'

        this.text = this.createElement('p', 'text')
        this.text.textContent = 'You can write some products, which you want to buy so that you dont forget about them in the store!'

        this.form = this.createElement('form', 'form')

        this.input = this.createElement('input', 'input')
        this.input.type = 'text'
        this.input.placeholder = 'Add product'
        this.input.name = 'addProduct'

        this.submitButton = this.createElement('button', 'button')
        this.submitButton.textContent = 'Add'

        this.list = this.createElement('ul', 'list')

        this.form.append(this.input, this.submitButton)

        this.app.append(this.title, this.text, this.form, this.list)

        this._temporaryProductText = ''
        this._initLocalListeners()
    }

    displayList(products) {
        while (this.list.firstChild) {
            this.list.removeChild(this.list.firstChild)
        }

        if (products.length === 0) {
            const p = this.createElement('p')
            p.classList.add('offer')
            p.textContent = 'Write your shopping list!'
            this.list.append(p)
        } else {
            products.forEach(product => {
                const li = this.createElement('li')
                li.classList.add('item')
                li.id = product.id

                const checkbox = this.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.checked = product.isBought

                const span = this.createElement('span')
                span.contentEditable = true
                span.classList.add('editable')

                if (product.isBought) {
                    span.textContent = product.product
                    span.classList.add('lineThrough')
                } else {
                    span.textContent = product.product
                }

                const deleteButton = this.createElement('button', 'delete')
                deleteButton.classList.add('delete')
                li.append(checkbox, span, deleteButton)

                this.list.append(li)
            })
        }
    }

    bindAddProduct(handler) {
        this.form.addEventListener('submit', evt => {
            evt.preventDefault()

            if (this._productText) {
                handler(this._productText)
                this._resetInput()
            }
        })
    }

    bindDeleteProduct(handler) {
        this.list.addEventListener('click', evt => {
            if (evt.target.className === 'delete') {
                const id = parseInt(evt.target.parentElement.id)

                handler(id)
            }
        })
    }

    bindToggleProduct(handler) {
        this.list.addEventListener('change', evt => {
            if (evt.target.type === 'checkbox') {
                const id = parseInt(evt.target.parentElement.id)

                handler(id)
            }
        })
    }

    get _productText() {
        return this.input.value
    }

    _resetInput() {
        this.input.value = ''
    }

    _initLocalListeners() {
        this.list.addEventListener('input', evt => {
            if (evt.target.className === 'editable') {
                this._temporaryProductText = evt.target.innerText
            }
        })
    }

    bindEditProduct(handler) {
        this.list.addEventListener('focusout', evt => {
            if (this._temporaryTodoText) {
                const id = parseInt(evt.target.parentElement.id)

                handler(id, this._temporaryProductText)
                this._temporaryProductText = ''
            }
        })
    }

    createElement(tag, className) {
        const element = document.createElement(tag)

        if (className) {
            element.classList.add(className);
        }

        return element
    }

    getElement(selector) {
        const element = document.querySelector(selector)

        return element
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.onProductListChanged(this.model.shoppingList)
        this.view.bindAddProduct(this.handleAddProduct)
        this.view.bindDeleteProduct(this.handleDeleteProduct)
        this.view.bindToggleProduct(this.handleToggleProduct)
        this.view.bindEditProduct(this.handleEditProduct)

        this.model.bindProductListChanged(this.onProductListChanged)
    }

    onProductListChanged = (shoppingList) => {
        this.view.displayList(shoppingList)
    }

    handleAddProduct = (productText) => {
        this.model.addToList(productText)
    }

    handleEditProduct = (id, productText) => {
        this.model.editProduct(id, productText)
    }

    handleDeleteProduct = (id) => {
        this.model.deleteProduct(id)
    }

    handleToggleProduct = (id) => {
        this.model.toggleProduct(id)
    }
}

const app = new Controller(new Model(), new View())
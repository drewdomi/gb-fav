import { GithubUser } from "./githubUser.js";

export class Favorites{
  constructor(root){
    this.root = document.querySelector(root)
    this.load()

  }
  load(){

    this.entries = JSON.parse(localStorage
      .getItem('@github-favorites:')) || []   
  }

  save(){
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username){
    try{

      const userExists = this.entries.find(entry => entry.login === username
)
      if(userExists) {
        throw new Error('Usuário já adicionado!')
      }

      const user = await GithubUser.search(username)
      if(user.login === undefined){
        throw new Error('Usuário não encontrado!')
      }
      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user){
    const filteredEntries = this.entries
      .filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites{
  constructor(root){
    super(root)
    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onadd()
  }
  onadd(){
    const addButton = this.root.querySelector('.search button')
    const input = this.root.querySelector('#input-search')

    document.body.addEventListener('keydown', (e) =>{
      if(e.key === 'Enter' && input.value !== ''){
        this.add(input.value)
        input.value = ''
      }
    })
    addButton.onclick = () =>{
      
      this.add(input.value)
      input.value = ''
    }
  }

  update(){
    this.removeAllTr()
    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector('img').src = `https://github.com/${user.login}.png`
      row.querySelector('img').alt = `Imagem de ${user.name}`
      row.querySelector('p').textContent = user.name
      row.querySelector('span').textContent = user.login
      row.querySelector('a').setAttribute('href', `https://github.com/${user.login}`)
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar esse user?')
        if(isOk){
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
    this.createRow()
  }

  createRow(){
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td>
        <button class="remove">&times;</button>
      </td>`
    return tr
  }

  removeAllTr(){
    this.tbody.querySelectorAll('tr')
      .forEach((tr) => {
        tr.remove()
      })
  }
}
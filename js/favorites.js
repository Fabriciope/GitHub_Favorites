import { GitHubUser } from "./GitHubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.tbody = this.root.querySelector("table tbody");
    this.load();
  }

  load() {
    this.data = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.data));
  }

  async add(username) {
    try {
      const userExists = this.data.find((entry) => entry.login == username);

      if (userExists) {
        throw new Error("Usuário já cadastrado");
      }

      const user = await GitHubUser.search(username);

      if (user === undefined) {
        throw new Error("Usuário não encontrado");
      }

      this.data = [user, ...this.data];
      this.save();
      this.update();
    } catch (error) {
      alert(error.message);
    }
  }

  deleteRow(username) {
    this.data = this.data.filter((userData) => userData.name != username);
    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.load();
    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".box_search button");
    addButton.onclick = () => {
      const inputSearch = this.root.querySelector(".box_search input");
      
      if (inputSearch.value != "") {
        this.add(inputSearch.value);
        inputSearch.value = "";
      }
    };
  }

  update() {
    this.removeAlltr();

    this.data.forEach((user) => {
      let row = this.createRow(user);
      this.tbody.append(row);
    });
  }

  removeAlltr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }

  createRow({ login, name, public_repos, followers }) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <tr>
        <td class="user">
            <img src="https://github.com/${login}.png" alt="" />
            <a href="https://github.com/${login}" target="_blank">
            <p>${login}</p>
            <span>${name}</span>
            </a>
        </td>
        <td class="repositories">${public_repos}</td>
        <td class="followers">${followers}</td>
        <td>
            <button>&times;</button>
        </td>
        </tr>
    `;

    tr.querySelector("button").onclick = () => {
      if (confirm(`Deseja excluir ${name}`)) {
        this.deleteRow(name);
      }
    };

    return tr;
  }
}

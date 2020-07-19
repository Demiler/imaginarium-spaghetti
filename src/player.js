export class Player {
  static get properties() {
    return {
      name: { type: String },
      icon: { type: String },
      status: { type: String },
      score: { type: Number }
    };
  }

  constructor(name, icon, status, score) {
    this.name = name;
    this.icon = icon;
    this.status = status;
    this.score = score;
  }

  static toJSON() {
    return { 
      name: this.name, 
      icon: this.icon, 
      status: this.status, 
      score: this.score 
    };
  }

  static fromJSON(data) {
    return new Player(
      data.name, 
      data.icon, 
      data.status, 
      data.score
  )};

}

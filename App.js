import React from 'react';
import './App.css';

// https://github.com/request/request#readme
const request = require('request');
const cheerio = require('cheerio');



// create and initialize local storage of recipes
let recipes = (typeof localStorage['recipes'] !== 'undefined')
  ? JSON.parse(localStorage['recipes'])
  : [
    {
      name: 'Shortbread',
      ingredients: [
        "¼ cup white sugar",
        "½ cup unsalted butter",
        "1 cup all-purpose flour",
        "⅓ cup white rice flour"],
      instructions: [
        "Preheat oven to 325 degrees F (165 degrees C).",
        "Line a baking sheet with greaseproof (parchment) paper.  Sift the flour and rice flour into a medium mixing bowl.  Add the sugar and mix.",
        "Cut butter into pieces and rub into the flour with your fingertips until the mixture begins to bind together.  Knead into soft dough.",
        "Roll the dough into an 8 inch round (or for exact round, mold it in an 8 inch cake pan). Place on baking sheet.",
        "Using a fork, prick top and make tine marks along edge.  Using a table knife, score top with wedge marks.  (This is where it will break when cooled)",
        "Bake 45 minutes or until pale golden in color.  Sprinkle a little superfine sugar over top and cool on baking sheet.",
        "Cut into wedges.  Keeps for weeks in airtight tin."
      ]
    }
  ]

localStorage.setItem('recipes', JSON.stringify(recipes))

// Button component renders button (expects label and handler)
const Button = (props) => <button className={props.cl} onClick={() => props.handler(props.index)} data-toggle={props.dataToggle} data-target={props.dataTarget}>{props.children}</button>

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newRecipeName: '',
      newRecipeIngredients: [],
      newRecipeInstructions: [],
      recipes: recipes
    }
  }

  addName(a) {
    this.setState({ newRecipeName: a.target.value })
  }

  addIngredients(a) {
    this.setState({ newRecipeIngredients: a.target.value.split(',') })
  }

  addInstructions(a) {
    this.setState({ newRecipeInstructions: a.target.value.split(',') })
  }

  addRecipe() {
    localStorage.setItem('recipes', JSON.stringify(this.state.recipes.concat({
      name: this.state.newRecipeName,
      ingredients: this.state.newRecipeIngredients,
      instructions: this.state.newRecipeInstructions
    }
    )))

    this.setState({
      recipes: this.state.recipes.concat({
        name: this.state.newRecipeName,
        ingredients: this.state.newRecipeIngredients,
        instructions: this.state.newRecipeInstructions
      }),
      newRecipeName: '',
      newRecipeIngredients: [],
      newRecipeInstructions: []
    })
  }

  addRecipeUrl() {
    const proxyUrl = "https://tranquil-shelf-76543.herokuapp.com/";
    const recipeUrl = document.getElementById('url').value;

    request.get(proxyUrl + recipeUrl, (error, response, html) => {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);
        let recipeDetails = {
          name: $('.headline-wrapper').children('h1').text(),
          ingredients: [],
          instructions: []
        };

        $('.ingredients-item span.ingredients-item-name').each((i, el) => {
          const ingredient = $(el).text().replace(/\s\s+/g, '');;
          recipeDetails.ingredients.push(ingredient);
        });

        $('.instructions-section p').each((i, el) => {
          const instruction = $(el).text().replace(/\s\s+/g, '');
          recipeDetails.instructions.push(instruction);
        });

        localStorage.setItem('recipes', JSON.stringify(this.state.recipes.concat({
          name: recipeDetails.name,
          ingredients: recipeDetails.ingredients,
          instructions: recipeDetails.instructions
        }
        )))

        this.setState({
          recipes: this.state.recipes.concat({
            name: recipeDetails.name,
            ingredients: recipeDetails.ingredients,
            instructions: recipeDetails.instructions
          }),
          newRecipeName: '',
          newRecipeIngredients: [],
          newRecipeInstructions: []
        })
      }
      this.clearText();
    });
  }

  deleteRecipe(index) {
    var recipes = JSON.parse(localStorage['recipes'])
    recipes.splice(index, 1)
    localStorage.setItem('recipes', JSON.stringify(recipes))
    this.setState({ recipes })
  }

  editRecipe(index) {
    console.log('edit', index);
    document.getElementById('edit-name').value = this.state.recipes[index].name;
    document.getElementById('edit-ingredients').value = this.state.recipes[index].ingredients;
    document.getElementById('edit-instructions').value = this.state.recipes[index].instructions;

    var self = this

    const editState = (recipes, self) => {
      self.setState({ recipes: recipes })
    }

    document.getElementById('edit-recipe').onclick = function () {

      var name = document.getElementById('edit-name').value;
      var ingredients = document.getElementById('edit-ingredients').value;
      var instructions = document.getElementById('edit-instructions').value;

      var recipes = JSON.parse(localStorage['recipes']);

      recipes[index]['name'] = name;
      recipes[index]['ingredients'] = ingredients.split(',');
      recipes[index]['instructions'] = instructions.split(',');

      localStorage.setItem('recipes', JSON.stringify(recipes))

      editState(recipes, self)
    }

  }

  // quick fix for URL entry field value persisting
  clearText() {
    document.getElementById('url').value = "";
  }

  render() {
    let recipes = this.state.recipes

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-1 col-sm-0 col-xs-0"></div>
          <div className="col-md-10 col-sm-12 col-xs-12">

            <h1>Your recipes</h1>
            {recipes.map((recipe, index) => (
              <div key={index}>
                <div className="accordion" id="accordion">
                  <div className="card">
                    <div className="card-header">
                      <h4 className="panel-title">
                        <a data-toggle="collapse" href={"#collapse" + index}>
                          {recipe.name}
                        </a>
                      </h4>
                    </div>
                    <div id={"collapse" + index} className="panel-collapse collapse in" data-parent="#accordion">
                      <div className="panel-body">
                        Ingredients:
                        <ul>{recipe.ingredients.map(ingredient => <li key={ingredient}> {ingredient} </li>)}</ul>
                        Instructions:
                        <ul>{recipe.instructions.map(ingredient => <li key={ingredient}> {ingredient} </li>)}</ul>

                        <span>&nbsp;&nbsp;</span>
                        <Button cl="btn btn-info" index={index} handler={this.editRecipe.bind(this)} dataToggle="modal" dataTarget="#myModal">Edit</Button>
                        <span>&nbsp;&nbsp;</span>
                        <Button cl="btn btn-danger" index={index} handler={this.deleteRecipe.bind(this)}>Delete</Button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}

            <br />
            <h1>Add a new recipe</h1>
            <input className="form-control" onChange={this.addName.bind(this)} type="text" placeholder="Title" value={this.state.newRecipeName} />

            <br />

            <textarea className="form-control" onChange={this.addIngredients.bind(this)} cols="50" rows="8" placeholder="Ingredients (comma separated)" value={this.state.newRecipeIngredients}></textarea>

            <br />

            <textarea className="form-control" onChange={this.addInstructions.bind(this)} cols="50" rows="8" placeholder="Instructions (comma separated)" value={this.state.newRecipeInstructions}></textarea>

            <br />

            <button type="button" className="btn btn-success" onClick={this.addRecipe.bind(this)}>Submit</button>

            <br />
            <br />


            <h1>Add a recipe by URL</h1>
            <p>(currently supports allrecipes.com only)</p>
            <input
              type="url"
              id="url"
              name="addRecipeUrl"
              className='form-control'
              placeholder="https://allrecipes.com/recipe/"
              size="50"
              value={this.state.url}
              required>
            </input>
            <br />
            <button type="button" className="btn btn-success" onClick={this.addRecipeUrl.bind(this)}>Submit</button>

            <br />
            <br />

          </div>
          <div className="col-md-1 col-sm-0 col-xs-0"></div>
        </div>

      </div>
    )
  }
}

export default App;

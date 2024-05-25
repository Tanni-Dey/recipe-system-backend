const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1tyqf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//all api
async function run() {
  try {
    await client.connect();
    const recipeCollection = client.db("recipeSystem").collection("recipes");
    const userCollection = client.db("recipeSystem").collection("users");

    // all data show api
    app.get("/recipe", async (req, res) => {
      const query = {};
      const recipes = recipeCollection.find(query);
      allRecipe = await recipes.toArray();
      res.send(allRecipe);
    });

    // create new user
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const user = await userCollection.findOne({ email: newUser.email });
      if (!user) {
        const addUser = await userCollection.insertOne(newUser);
        res.send({ status: "Successfully create user", user: addUser });
      } else {
        res.send({ status: "Already have this user" });
      }
    });

    // add new recipe
    app.post("/recipes", async (req, res) => {
      const newRecipe = req.body;
      const recipe = await recipeCollection.findOne({
        recipeName: newRecipe.recipeName,
      });
      if (!recipe) {
        const addRecipe = await recipeCollection.insertOne(newRecipe);
        res.send({ status: "Successfully Added Recipe", user: addRecipe });
      } else {
        res.send({ status: "Already have Recipe" });
      }
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Recipe System");
});

app.listen(port, () => {
  console.log("Recipe System Connected", port);
});

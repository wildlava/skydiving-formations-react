import { useState, useEffect } from 'react';
import './App.css';

const space_id = process.env.REACT_APP_SPACE_ID;
const access_token = process.env.REACT_APP_DELIVERY_TOKEN;

const query = `
{
  formationCollection {
    items {
      name
      diagram {
        url
      }
    }
  }
}
`;

function App() {
  const [formation, setFormation] = useState(null);

  useEffect(() => {
    window
      .fetch(`https://graphql.contentful.com/content/v1/spaces/${space_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ query }),
      })
      .then((response) => response.json())
      .then(({ data, errors }) => {
        if (errors) {
          console.error(errors);
        }

        setFormation(data.formationCollection.items[0]);
      });
  }, []);

  if (!formation) {
    return "Loading...";
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={formation.diagram.url} className="App-diagram" alt="diagram" />
        <p>{formation.name}</p>
      </header>
    </div>
  );
}

export default App;

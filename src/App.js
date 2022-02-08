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
  const [page, setPage] = useState(null);

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

        setPage(data.formationCollection.items[0]);
      });
  }, []);

  if (!page) {
    return "Loading...";
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={page.diagram.url} className="App-diagram" alt="diagram" />
        <p>{page.name}</p>
      </header>
    </div>
  );
}

export default App;
